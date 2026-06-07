'use server'

import { auth } from '@/auth'
import { db } from '@/lib/db'
import { CreateTagSchema, UpdateTagSchema, AssignTagsSchema } from '@/schemas/tag.schema'
import { revalidatePath } from 'next/cache'

export type TagActionResponse<T = unknown> = {
  success: boolean
  data?: T
  error?: string
}

export type TagActionItem = {
  id: string
  name: string
  color: string
}

export async function getUserTagsAction(): Promise<TagActionResponse<TagActionItem[]>> {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: 'Unauthenticated' }
  }
  try {
    const tags = await db.tag.findMany({
      where: { userId: session.user.id },
      select: { id: true, name: true, color: true },
      orderBy: { name: 'asc' },
    })
    return { success: true, data: tags }
  } catch (error) {
    console.error('Get user tags error:', error)
    return { success: false, error: 'Something went wrong.' }
  }
}

export async function createTagAction(input: unknown): Promise<TagActionResponse> {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: 'Unauthenticated' }
  }

  const parsed = CreateTagSchema.safeParse(input)
  if (!parsed.success) {
    const errorMsg = parsed.error.issues.map(e => e.message).join(', ')
    return { success: false, error: errorMsg }
  }

  const { name, color } = parsed.data

  try {
    const existing = await db.tag.findUnique({
      where: {
        userId_name: {
          userId: session.user.id,
          name,
        },
      },
    })

    if (existing) {
      return { success: false, error: 'A tag with this name already exists.' }
    }

    const tag = await db.tag.create({
      data: {
        userId: session.user.id,
        name,
        color,
      },
    })

    revalidatePath('/dashboard')
    return { success: true, data: tag }
  } catch (error) {
    console.error('Create tag error:', error)
    return { success: false, error: 'Something went wrong. Please try again.' }
  }
}

export async function updateTagAction(input: unknown): Promise<TagActionResponse> {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: 'Unauthenticated' }
  }

  const parsed = UpdateTagSchema.safeParse(input)
  if (!parsed.success) {
    const errorMsg = parsed.error.issues.map(e => e.message).join(', ')
    return { success: false, error: errorMsg }
  }

  const { id: tagId, name, color } = parsed.data

  try {
    const tag = await db.tag.findUnique({
      where: { id: tagId },
      select: { userId: true },
    })

    if (!tag) {
      return { success: false, error: 'Tag not found.' }
    }

    if (tag.userId !== session.user.id) {
      return { success: false, error: 'Forbidden.' }
    }

    // Check name collision
    const existing = await db.tag.findFirst({
      where: {
        userId: session.user.id,
        name,
        id: { not: tagId },
      },
    })

    if (existing) {
      return { success: false, error: 'Another tag with this name already exists.' }
    }

    const updated = await db.tag.update({
      where: { id: tagId },
      data: {
        name,
        color,
      },
    })

    revalidatePath('/dashboard')
    return { success: true, data: updated }
  } catch (error) {
    console.error('Update tag error:', error)
    return { success: false, error: 'Something went wrong. Please try again.' }
  }
}

export async function deleteTagAction(tagId: string): Promise<TagActionResponse> {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: 'Unauthenticated' }
  }

  try {
    const tag = await db.tag.findUnique({
      where: { id: tagId },
      select: { userId: true },
    })

    if (!tag) {
      return { success: false, error: 'Tag not found.' }
    }

    if (tag.userId !== session.user.id) {
      return { success: false, error: 'Forbidden.' }
    }

    await db.tag.delete({
      where: { id: tagId },
    })

    revalidatePath('/dashboard')
    return { success: true }
  } catch (error) {
    console.error('Delete tag error:', error)
    return { success: false, error: 'Something went wrong. Please try again.' }
  }
}

export async function assignTagsToLinkAction(input: unknown): Promise<TagActionResponse> {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: 'Unauthenticated' }
  }

  const parsed = AssignTagsSchema.safeParse(input)
  if (!parsed.success) {
    const errorMsg = parsed.error.issues.map(e => e.message).join(', ')
    return { success: false, error: errorMsg }
  }

  const { linkId, tagIds } = parsed.data

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

    // Verify all tags belong to user
    const tags = await db.tag.findMany({
      where: {
        id: { in: tagIds },
        userId: session.user.id,
      },
      select: { id: true },
    })

    if (tags.length !== tagIds.length) {
      return { success: false, error: 'Invalid tags provided.' }
    }

    // Replace link's tags in a transaction
    await db.$transaction(async (tx) => {
      // Delete existing
      await tx.linkTag.deleteMany({
        where: { linkId },
      })

      // Create new
      if (tagIds.length > 0) {
        await tx.linkTag.createMany({
          data: tagIds.map((tagId) => ({
            linkId,
            tagId,
          })),
        })
      }
    })

    revalidatePath('/dashboard')
    return { success: true }
  } catch (error) {
    console.error('Assign tags error:', error)
    return { success: false, error: 'Something went wrong. Please try again.' }
  }
}
