'use server'

import { auth } from '@/auth'
import { db } from '@/lib/db'
import { CreateLinkSchema, UpdateLinkSchema } from '@/schemas/link.schema'
import { BulkDeleteSchema, BulkArchiveSchema, BulkTagSchema } from '@/schemas/tag.schema'
import { extractDomain, scrapeTitle } from '@/lib/utils'
import { revalidatePath } from 'next/cache'

export type LinkActionResponse<T = unknown> = {
  success: boolean
  data?: T
  error?: string
}

export async function createLinkAction(input: unknown): Promise<LinkActionResponse> {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: 'Unauthenticated' }
  }

  const parsed = CreateLinkSchema.safeParse(input)
  if (!parsed.success) {
    const errorMsg = parsed.error.issues.map(e => e.message).join(', ')
    return { success: false, error: errorMsg }
  }

  const { url, title: inputTitle, description, tagIds } = parsed.data
  const domainName = extractDomain(url)

  if (!domainName) {
    return { success: false, error: 'Could not extract valid domain from URL.' }
  }

  try {
    // Verify tags ownership
    if (tagIds && tagIds.length > 0) {
      const tagsCount = await db.tag.count({
        where: {
          id: { in: tagIds },
          userId: session.user.id,
        },
      })
      if (tagsCount !== tagIds.length) {
        return { success: false, error: 'Invalid tags provided.' }
      }
    }

    // 1. Scrape title if not provided
    const finalTitle = inputTitle || (await scrapeTitle(url))

    // 2. Generate Favicon URL
    const faviconUrl = `https://www.google.com/s2/favicons?domain=${domainName}&sz=64`

    // 3. Prisma transaction to upsert domain and create link
    const result = await db.$transaction(async (tx) => {
      // Find or create Domain record scoped to this user
      let domain = await tx.domain.findUnique({
        where: {
          userId_name: {
            userId: session.user!.id!,
            name: domainName,
          },
        },
      })

      if (!domain) {
        // Human-readable capitalized name, e.g. "github.com" -> "Github"
        const displayName = domainName.split('.')[0]
        const capitalized = displayName.charAt(0).toUpperCase() + displayName.slice(1)

        domain = await tx.domain.create({
          data: {
            userId: session.user!.id!,
            name: domainName,
            displayName: capitalized,
            faviconUrl,
          },
        })
      }

      // Create Link record
      const link = await tx.link.create({
        data: {
          userId: session.user!.id!,
          domainId: domain.id,
          url,
          title: finalTitle,
          description: description || null,
          faviconUrl,
          tags: {
            create: tagIds?.map(tagId => ({ tagId })) || [],
          },
        },
        include: {
          domain: true,
          tags: {
            include: {
              tag: true,
            },
          },
        },
      })

      return link
    })

    revalidatePath('/dashboard')
    return { success: true, data: result }
  } catch (error) {
    console.error('Create link error:', error)
    return { success: false, error: 'Something went wrong. Please try again.' }
  }
}

export async function updateLinkAction(input: unknown): Promise<LinkActionResponse> {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: 'Unauthenticated' }
  }

  const parsed = UpdateLinkSchema.safeParse(input)
  if (!parsed.success) {
    const errorMsg = parsed.error.issues.map(e => e.message).join(', ')
    return { success: false, error: errorMsg }
  }

  const { id: linkId, title, description, tagIds } = parsed.data

  try {
    // 1. Verify ownership pattern
    const link = await db.link.findUnique({
      where: { id: linkId },
      select: { userId: true },
    })

    if (!link) {
      return { success: false, error: 'Link not found.' }
    }

    if (link.userId !== session.user.id) {
      return { success: false, error: 'Forbidden.' }
    }

    // Verify tags ownership
    if (tagIds && tagIds.length > 0) {
      const tagsCount = await db.tag.count({
        where: {
          id: { in: tagIds },
          userId: session.user.id,
        },
      })
      if (tagsCount !== tagIds.length) {
        return { success: false, error: 'Invalid tags provided.' }
      }
    }

    // 2. Perform edit mutation inside a transaction
    const updated = await db.$transaction(async (tx) => {
      const updatedLink = await tx.link.update({
        where: { id: linkId },
        data: {
          title,
          description: description || null,
        },
      })

      if (tagIds !== undefined) {
        // Delete existing relations
        await tx.linkTag.deleteMany({
          where: { linkId },
        })

        // Create new relations
        if (tagIds.length > 0) {
          await tx.linkTag.createMany({
            data: tagIds.map((tagId) => ({
              linkId,
              tagId,
            })),
          })
        }
      }

      return updatedLink
    })

    revalidatePath('/dashboard')
    revalidatePath('/archive')
    return { success: true, data: updated }
  } catch (error) {
    console.error('Update link error:', error)
    return { success: false, error: 'Something went wrong. Please try again.' }
  }
}

export async function deleteLinkAction(linkId: string): Promise<LinkActionResponse> {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: 'Unauthenticated' }
  }

  try {
    // 1. Verify ownership pattern
    const link = await db.link.findUnique({
      where: { id: linkId },
      select: { userId: true, domainId: true },
    })

    if (!link) {
      return { success: false, error: 'Link not found.' }
    }

    if (link.userId !== session.user.id) {
      return { success: false, error: 'Forbidden.' }
    }

    // 2. Delete the link and check if domain cleanup is needed
    await db.$transaction(async (tx) => {
      await tx.link.delete({
        where: { id: linkId },
      })

      // Count remaining links for this domain
      const remainingCount = await tx.link.count({
        where: {
          domainId: link.domainId,
          userId: session.user!.id!,
        },
      })

      if (remainingCount === 0) {
        // Delete domain if orphaned
        await tx.domain.delete({
          where: { id: link.domainId },
        })
      }
    })

    revalidatePath('/dashboard')
    revalidatePath('/archive')
    return { success: true }
  } catch (error) {
    console.error('Delete link error:', error)
    return { success: false, error: 'Something went wrong. Please try again.' }
  }
}

export async function archiveLinkAction(linkId: string): Promise<LinkActionResponse> {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: 'Unauthenticated' }
  }

  try {
    const link = await db.link.findUnique({
      where: { id: linkId },
      select: { userId: true },
    })

    if (!link) {
      return { success: false, error: 'Link not found.' }
    }

    if (link.userId !== session.user.id) {
      return { success: false, error: 'Forbidden.' }
    }

    await db.link.update({
      where: { id: linkId },
      data: { isArchived: true },
    })

    revalidatePath('/dashboard')
    revalidatePath('/archive')
    return { success: true }
  } catch (error) {
    console.error('Archive link error:', error)
    return { success: false, error: 'Something went wrong. Please try again.' }
  }
}

export async function unarchiveLinkAction(linkId: string): Promise<LinkActionResponse> {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: 'Unauthenticated' }
  }

  try {
    const link = await db.link.findUnique({
      where: { id: linkId },
      select: { userId: true },
    })

    if (!link) {
      return { success: false, error: 'Link not found.' }
    }

    if (link.userId !== session.user.id) {
      return { success: false, error: 'Forbidden.' }
    }

    await db.link.update({
      where: { id: linkId },
      data: { isArchived: false },
    })

    revalidatePath('/dashboard')
    revalidatePath('/archive')
    return { success: true }
  } catch (error) {
    console.error('Unarchive link error:', error)
    return { success: false, error: 'Something went wrong. Please try again.' }
  }
}

export async function bulkDeleteAction(input: unknown): Promise<LinkActionResponse> {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: 'Unauthenticated' }
  }

  const parsed = BulkDeleteSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues.map(e => e.message).join(', ') }
  }

  const { linkIds } = parsed.data

  try {
    const links = await db.link.findMany({
      where: {
        id: { in: linkIds },
        userId: session.user.id,
      },
      select: { id: true, domainId: true },
    })

    if (links.length !== linkIds.length) {
      return { success: false, error: 'Some links were not found or access is forbidden.' }
    }

    const domainIds = Array.from(new Set(links.map(l => l.domainId)))

    await db.$transaction(async (tx) => {
      await tx.link.deleteMany({
        where: {
          id: { in: linkIds },
        },
      })

      for (const domainId of domainIds) {
        const remainingCount = await tx.link.count({
          where: {
            domainId,
            userId: session.user!.id!,
          },
        })

        if (remainingCount === 0) {
          await tx.domain.delete({
            where: { id: domainId },
          })
        }
      }
    })

    revalidatePath('/dashboard')
    revalidatePath('/archive')
    return { success: true }
  } catch (error) {
    console.error('Bulk delete error:', error)
    return { success: false, error: 'Something went wrong. Please try again.' }
  }
}

export async function bulkArchiveAction(input: unknown): Promise<LinkActionResponse> {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: 'Unauthenticated' }
  }

  const parsed = BulkArchiveSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues.map(e => e.message).join(', ') }
  }

  const { linkIds } = parsed.data

  try {
    const linksCount = await db.link.count({
      where: {
        id: { in: linkIds },
        userId: session.user.id,
      },
    })

    if (linksCount !== linkIds.length) {
      return { success: false, error: 'Some links were not found or access is forbidden.' }
    }

    await db.link.updateMany({
      where: {
        id: { in: linkIds },
      },
      data: {
        isArchived: true,
      },
    })

    revalidatePath('/dashboard')
    revalidatePath('/archive')
    return { success: true }
  } catch (error) {
    console.error('Bulk archive error:', error)
    return { success: false, error: 'Something went wrong. Please try again.' }
  }
}

export async function bulkUnarchiveAction(input: unknown): Promise<LinkActionResponse> {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: 'Unauthenticated' }
  }

  const parsed = BulkArchiveSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues.map(e => e.message).join(', ') }
  }

  const { linkIds } = parsed.data

  try {
    const linksCount = await db.link.count({
      where: {
        id: { in: linkIds },
        userId: session.user.id,
      },
    })

    if (linksCount !== linkIds.length) {
      return { success: false, error: 'Some links were not found or access is forbidden.' }
    }

    await db.link.updateMany({
      where: {
        id: { in: linkIds },
      },
      data: {
        isArchived: false,
      },
    })

    revalidatePath('/dashboard')
    revalidatePath('/archive')
    return { success: true }
  } catch (error) {
    console.error('Bulk unarchive error:', error)
    return { success: false, error: 'Something went wrong. Please try again.' }
  }
}

export async function bulkTagAction(input: unknown): Promise<LinkActionResponse> {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: 'Unauthenticated' }
  }

  const parsed = BulkTagSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues.map(e => e.message).join(', ') }
  }

  const { linkIds, tagIds } = parsed.data

  try {
    const linksCount = await db.link.count({
      where: {
        id: { in: linkIds },
        userId: session.user.id,
      },
    })

    if (linksCount !== linkIds.length) {
      return { success: false, error: 'Some links were not found or access is forbidden.' }
    }

    const tagsCount = await db.tag.count({
      where: {
        id: { in: tagIds },
        userId: session.user.id,
      },
    })

    if (tagsCount !== tagIds.length) {
      return { success: false, error: 'Some tags were not found or access is forbidden.' }
    }

    await db.$transaction(async (tx) => {
      await tx.linkTag.deleteMany({
        where: {
          linkId: { in: linkIds },
          tagId: { in: tagIds },
        },
      })

      const relations = []
      for (const linkId of linkIds) {
        for (const tagId of tagIds) {
          relations.push({ linkId, tagId })
        }
      }

      if (relations.length > 0) {
        await tx.linkTag.createMany({
          data: relations,
        })
      }
    })

    revalidatePath('/dashboard')
    return { success: true }
  } catch (error) {
    console.error('Bulk tag error:', error)
    return { success: false, error: 'Something went wrong. Please try again.' }
  }
}

export async function checkLinksAction(): Promise<LinkActionResponse<{ checked: number; dead: number }>> {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: 'Unauthenticated' }
  }

  try {
    const { checkAllLinks } = await import('@/lib/deadLinkChecker')
    const result = await checkAllLinks()
    revalidatePath('/dashboard')
    revalidatePath('/archive')
    return { success: true, data: result }
  } catch (error) {
    console.error('Check links action error:', error)
    return { success: false, error: 'Failed to run link checks. Please try again.' }
  }
}
