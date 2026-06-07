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

  // Fetch user links scoped to user, selecting only needed fields
  const linksRaw = await db.link.findMany({
    where: { userId: session.user.id },
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
    },
    orderBy: { createdAt: 'desc' },
  })

  // Format links to match LinkItem type structure
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
  }))

  // Fetch user domains, selecting only needed fields and including link counts
  const domainsRaw = await db.domain.findMany({
    where: { userId: session.user.id },
    select: {
      id: true,
      name: true,
      displayName: true,
      faviconUrl: true,
      _count: {
        select: {
          links: true,
        },
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
      links: d._count.links,
    },
  }))

  return (
    <DashboardClient
      initialLinks={links}
      initialDomains={domains}
    />
  )
}
