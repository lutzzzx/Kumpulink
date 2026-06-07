import React from 'react'
import { auth } from '@/auth'
import { db } from '@/lib/db'
import { redirect } from 'next/navigation'
import { DashboardClient } from '@/components/dashboard/DashboardClient'
import { type LinkItem } from '@/components/links/LinkCard'
import { type DomainFilterItem } from '@/components/dashboard/DomainFilter'

export const metadata = {
  title: 'Dashboard - Kumpulink',
  description: 'Manage your saved bookmarks, view automatic domain groupings, and check dead links.',
}

export default async function DashboardPage(): Promise<React.JSX.Element> {
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/login')
  }

  // Fetch user links, domains, and tags in parallel
  const [linksRaw, domainsRaw, tags] = await Promise.all([
    db.link.findMany({
      where: {
        userId: session.user.id,
        isArchived: false,
      },
      select: {
        id: true,
        url: true,
        title: true,
        description: true,
        faviconUrl: true,
        isDead: true,
        isArchived: true,
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
      orderBy: { createdAt: 'desc' },
    }),
    db.domain.findMany({
      where: { userId: session.user.id },
      select: {
        id: true,
        name: true,
        displayName: true,
        faviconUrl: true,
        links: {
          where: { isArchived: false },
          select: { id: true },
        },
      },
      orderBy: { name: 'asc' },
    }),
    db.tag.findMany({
      where: { userId: session.user.id },
      select: {
        id: true,
        name: true,
        color: true,
      },
      orderBy: { name: 'asc' },
    }),
  ])

  // Format links to match LinkItem type structure
  const links: LinkItem[] = linksRaw.map(link => ({
    id: link.id,
    url: link.url,
    title: link.title,
    description: link.description,
    faviconUrl: link.faviconUrl,
    isDead: link.isDead,
    isArchived: link.isArchived,
    lastChecked: link.lastChecked ? link.lastChecked.toISOString() : null,
    httpStatus: link.httpStatus,
    domain: {
      name: link.domain.name,
    },
    tags: link.tags.map(t => t.tag),
  }))

  const domains: DomainFilterItem[] = domainsRaw.map(d => ({
    id: d.id,
    name: d.name,
    displayName: d.displayName,
    faviconUrl: d.faviconUrl,
    _count: {
      links: d.links.length,
    },
  })).filter(d => d._count.links > 0) // Only show domains that have active links

  return (
    <DashboardClient
      initialLinks={links}
      initialDomains={domains}
      initialTags={tags}
    />
  )
}
