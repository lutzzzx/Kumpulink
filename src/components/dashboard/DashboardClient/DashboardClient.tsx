'use client'

import React, { useState, useTransition } from 'react'
import { SearchBar } from '../SearchBar'
import { DomainFilter, type DomainFilterItem } from '../DomainFilter'
import { LinkCard, type LinkItem } from '@/components/links/LinkCard'
import { EditLinkModal } from '@/components/links/EditLinkModal'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { deleteLinkAction } from '@/actions/link.actions'
import styles from './DashboardClient.module.css'

export interface DashboardClientProps {
  initialLinks: LinkItem[]
  initialDomains: DomainFilterItem[]
}

export function DashboardClient({
  initialLinks,
  initialDomains
}: DashboardClientProps): React.JSX.Element {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null)
  
  // Modals state
  const [editingLink, setEditingLink] = useState<LinkItem | null>(null)
  const [deletingLinkId, setDeletingLinkId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [deleteError, setDeleteError] = useState<string | null>(null)

  // Filter links on query and domain selection
  const filteredLinks = initialLinks.filter((link) => {
    const matchesSearch =
      link.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (link.description?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      link.url.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesDomain = selectedDomain ? link.domain.name === selectedDomain : true

    return matchesSearch && matchesDomain
  })

  // Group filtered links by domain
  // We keep order of domains as they are in the database or sorted by link creation
  const groupedLinks: Record<string, { domain: { name: string; displayName: string; faviconUrl: string | null }; links: LinkItem[] }> = {}
  
  filteredLinks.forEach((link) => {
    const dName = link.domain.name
    if (!groupedLinks[dName]) {
      groupedLinks[dName] = {
        domain: {
          name: dName,
          displayName: link.domain.name.split('.')[0].charAt(0).toUpperCase() + link.domain.name.split('.')[0].slice(1),
          faviconUrl: link.faviconUrl
        },
        links: []
      }
    }
    groupedLinks[dName].links.push(link)
  })

  // Find actual display names from domain records if possible
  Object.keys(groupedLinks).forEach((key) => {
    const domainRecord = initialDomains.find(d => d.name === key)
    if (domainRecord) {
      groupedLinks[key].domain.displayName = domainRecord.displayName
      groupedLinks[key].domain.faviconUrl = domainRecord.faviconUrl
    }
  })

  const handleDeleteConfirm = () => {
    if (!deletingLinkId) return
    setDeleteError(null)

    startTransition(async () => {
      const res = await deleteLinkAction(deletingLinkId)
      if (res.success) {
        setDeletingLinkId(null)
      } else {
        setDeleteError(res.error || 'Failed to delete link.')
      }
    })
  }

  return (
    <div className={styles.dashboardLayout}>
      {/* Sidebar Filter */}
      <aside className={styles.sidebar}>
        <DomainFilter
          domains={initialDomains}
          selectedDomain={selectedDomain}
          onSelect={setSelectedDomain}
          totalCount={initialLinks.length}
        />
      </aside>

      {/* Main Content Area */}
      <main className={styles.mainContent}>
        <SearchBar value={searchQuery} onChange={setSearchQuery} />

        {filteredLinks.length === 0 ? (
          <div className={styles.emptyState}>
            <h2 className={styles.emptyTitle}>No Links Found</h2>
            <p>
              {searchQuery
                ? 'Try adjusting your search keywords.'
                : 'Get started by clicking "Add Link" at the top right!'}
            </p>
          </div>
        ) : (
          Object.keys(groupedLinks).map((domainKey) => {
            const group = groupedLinks[domainKey]
            return (
              <section key={domainKey} className={styles.domainSection}>
                <div className={styles.domainHeader}>
                  {group.domain.faviconUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={group.domain.faviconUrl}
                      alt=""
                      className={styles.domainFavicon}
                      onError={(e) => {
                        ;(e.target as HTMLImageElement).src = `https://www.google.com/s2/favicons?domain=${domainKey}&sz=64`
                      }}
                    />
                  ) : (
                    <div className={`${styles.domainFavicon} ${styles.faviconPlaceholder}`}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"/>
                      </svg>
                    </div>
                  )}
                  <h2 className={styles.domainTitle}>
                    {group.domain.displayName}{' '}
                    <span className={styles.domainCount}>
                      ({group.links.length})
                    </span>
                  </h2>
                </div>
                <div className={styles.linksGrid}>
                  {group.links.map((link) => (
                    <LinkCard
                      key={link.id}
                      link={link}
                      onEdit={setEditingLink}
                      onDelete={setDeletingLinkId}
                    />
                  ))}
                </div>
              </section>
            )
          })
        )}
      </main>

      {/* Modals */}
      {editingLink && (
        <EditLinkModal
          isOpen={editingLink !== null}
          onClose={() => setEditingLink(null)}
          link={editingLink}
        />
      )}

      <Modal
        isOpen={deletingLinkId !== null}
        onClose={() => setDeletingLinkId(null)}
        title="Delete Link"
      >
        <div className={styles.deleteConfirmText}>
          Are you sure you want to delete this bookmark? This action cannot be undone.
          {deleteError && (
            <div className={styles.deleteError}>
              {deleteError}
            </div>
          )}
        </div>
        <div className={styles.deleteActions}>
          <Button
            variant="ghost"
            size="md"
            onClick={() => setDeletingLinkId(null)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            size="md"
            onClick={handleDeleteConfirm}
            disabled={isPending}
          >
            {isPending ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
      </Modal>
    </div>
  )
}
