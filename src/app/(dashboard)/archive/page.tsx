import React from 'react'
import { auth } from '@/auth'
import { db } from '@/lib/db'
import { redirect } from 'next/navigation'
import { ArchiveClient } from '@/components/links/ArchiveClient'
import { type LinkItem } from '@/components/links/LinkCard'
import { type DomainFilterItem } from '@/components/dashboard/DomainFilter'

export const metadata = {
  title: 'Archive - Kumpulink',
  description: 'Manage your archived bookmarks.',
}

export default async function ArchivePage(): Promise<React.JSX.Element> {
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/login')
  }

  // Fetch user archived links
  const linksRaw = await db.link.findMany({
    where: {
      userId: session.user.id,
      isArchived: true,
    },
    select: {
      id: true,
      url: true,
      title: true,
      description: true,
      faviconUrl: true,
      isDead: true,
      lastChecked: true,
      httpStatus: true,
      domain: {
        select: {
          name: true,
        },
      },
      tags: {
        select: {
          tag: {
            select: {
              id: true,
              name: true,
              color: true,
            },
          },
        },
      },
    },
    orderBy: { updatedAt: 'desc' },
  })

  // Format links
  const links: LinkItem[] = linksRaw.map(link => ({
    id: link.id,
    url: link.url,
    title: link.title,
    description: link.description,
    faviconUrl: link.faviconUrl,
    isDead: link.isDead,
    lastChecked: link.lastChecked ? link.lastChecked.toISOString() : null,
    httpStatus: link.httpStatus,
    domain: {
      name: link.domain.name,
    },
    tags: link.tags.map(t => t.tag),
  }))

  // Fetch domains that contain archived links
  const domainsRaw = await db.domain.findMany({
    where: { userId: session.user.id },
    select: {
      id: true,
      name: true,
      displayName: true,
      faviconUrl: true,
      links: {
        where: { isArchived: true },
        select: { id: true },
      },
    },
    orderBy: { name: 'asc' },
  })

  const domains: DomainFilterItem[] = domainsRaw.map(d => ({
    id: d.id,
    name: d.name,
    displayName: d.displayName,
    faviconUrl: d.faviconUrl,
    _count: {
      links: d.links.length,
    },
  })).filter(d => d._count.links > 0)

  return (
    <ArchiveClient
      initialLinks={links}
      initialDomains={domains}
    />
  )
}
