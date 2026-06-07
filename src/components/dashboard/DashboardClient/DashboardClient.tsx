'use client'

import React, { useState, useTransition } from 'react'
import { SearchBar } from '../SearchBar'
import { DomainFilter, type DomainFilterItem } from '../DomainFilter'
import { LinkCard, type LinkItem } from '@/components/links/LinkCard'
import { EditLinkModal } from '@/components/links/EditLinkModal'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { deleteLinkAction, archiveLinkAction, bulkDeleteAction, bulkArchiveAction } from '@/actions/link.actions'
import { BulkActionBar } from '../BulkActionBar'
import { TagManager } from '@/components/tags/TagManager'
import { type TagItem } from '@/components/tags/TagPicker'
import { useMobileUI } from '@/context/MobileUIContext'
import { FilterSheet } from '@/components/mobile/FilterSheet'
import { WebviewModal } from '@/components/links/WebviewModal'
import styles from './DashboardClient.module.css'

export interface DashboardClientProps {
  initialLinks: LinkItem[]
  initialDomains: DomainFilterItem[]
  initialTags: TagItem[]
}

export function DashboardClient({
  initialLinks,
  initialDomains,
  initialTags,
}: DashboardClientProps): React.JSX.Element {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null)
  
  // Modals state
  const [editingLink, setEditingLink] = useState<LinkItem | null>(null)
  const [deletingLinkId, setDeletingLinkId] = useState<string | null>(null)
  const [previewLink, setPreviewLink] = useState<LinkItem | null>(null)
  const { filterSheetOpen, setFilterSheetOpen, tagManagerOpen, setTagManagerOpen } = useMobileUI()
  const [isPending, startTransition] = useTransition()
  const [deleteError, setDeleteError] = useState<string | null>(null)

  // Bulk mode states
  const [isBulkMode, setIsBulkMode] = useState(false)
  const [selectedLinkIds, setSelectedLinkIds] = useState<string[]>([])

  // Filter links on query and domain selection
  const filteredLinks = initialLinks.filter((link) => {
    const matchesSearch =
      link.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (link.description?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      link.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
      link.domain.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (link.tags?.some(tag => tag.name.toLowerCase().includes(searchQuery.toLowerCase())) || false)

    const matchesDomain = selectedDomain ? link.domain.name === selectedDomain : true

    return matchesSearch && matchesDomain
  })

  // Group filtered links by domain
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

  const handleArchiveLink = (linkId: string) => {
    startTransition(async () => {
      const res = await archiveLinkAction(linkId)
      if (!res.success) {
        alert(res.error || 'Failed to archive link.')
      }
    })
  }

  const handleSelectLink = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedLinkIds(prev => [...prev, id])
    } else {
      setSelectedLinkIds(prev => prev.filter(item => item !== id))
    }
  }

  const handleDeselectAll = () => {
    setSelectedLinkIds([])
  }

  const handleBulkArchive = () => {
    if (selectedLinkIds.length === 0) return
    if (window.confirm(`Are you sure you want to archive ${selectedLinkIds.length} bookmarks?`)) {
      startTransition(async () => {
        const res = await bulkArchiveAction({ linkIds: selectedLinkIds })
        if (res.success) {
          setSelectedLinkIds([])
          setIsBulkMode(false)
        } else {
          alert(res.error || 'Failed to archive links.')
        }
      })
    }
  }

  const handleBulkDelete = () => {
    if (selectedLinkIds.length === 0) return
    if (window.confirm(`Are you sure you want to permanently delete ${selectedLinkIds.length} bookmarks? This cannot be undone.`)) {
      startTransition(async () => {
        const res = await bulkDeleteAction({ linkIds: selectedLinkIds })
        if (res.success) {
          setSelectedLinkIds([])
          setIsBulkMode(false)
        } else {
          alert(res.error || 'Failed to delete links.')
        }
      })
    }
  }

  const toggleBulkMode = () => {
    setIsBulkMode(!isBulkMode)
    setSelectedLinkIds([])
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
        <div className={styles.toolbar}>
          <div style={{ flexGrow: 1, width: '100%' }}>
            <SearchBar value={searchQuery} onChange={setSearchQuery} />
          </div>
          <div className={styles.toolbarActions}>
            <Button
              variant={isBulkMode ? 'primary' : 'ghost'}
              size="md"
              onClick={toggleBulkMode}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: 6 }}>
                <path d="M9 11l3 3L22 4"/>
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
              </svg>
              {isBulkMode ? 'Cancel Selection' : 'Select Bookmarks'}
            </Button>
            <Button
              variant="ghost"
              size="md"
              onClick={() => setTagManagerOpen(true)}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: 6 }}>
                <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
                <line x1="7" y1="7" x2="7.01" y2="7"/>
              </svg>
              Manage Tags
            </Button>
          </div>
        </div>

        {filteredLinks.length === 0 ? (
          <div className={styles.emptyState}>
            <h2 className={styles.emptyTitle}>No Links Found</h2>
            <p>
              {searchQuery
                ? 'Try adjusting your search keywords or tags.'
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
                      onArchive={handleArchiveLink}
                      isSelectable={isBulkMode}
                      isSelected={selectedLinkIds.includes(link.id)}
                      onSelect={handleSelectLink}
                      onPreview={setPreviewLink}
                    />
                  ))}
                </div>
              </section>
            )
          })
        )}
      </main>

      {/* Bulk Action Bar */}
      {isBulkMode && selectedLinkIds.length > 0 && (
        <BulkActionBar
          selectedCount={selectedLinkIds.length}
          onDeselectAll={handleDeselectAll}
          onArchiveSelected={handleBulkArchive}
          onDeleteSelected={handleBulkDelete}
          isPending={isPending}
        />
      )}

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

      {/* Tag Manager Modal */}
      <Modal
        isOpen={tagManagerOpen}
        onClose={() => setTagManagerOpen(false)}
        title="Manage Custom Tags"
      >
        <TagManager tags={initialTags} />
      </Modal>

      {/* Mobile Filter Sheet */}
      <FilterSheet
        isOpen={filterSheetOpen}
        onClose={() => setFilterSheetOpen(false)}
      >
        <DomainFilter
          domains={initialDomains}
          selectedDomain={selectedDomain}
          onSelect={(dom) => {
            setSelectedDomain(dom)
            setFilterSheetOpen(false)
          }}
          totalCount={initialLinks.length}
          forceVertical
        />
      </FilterSheet>

      {/* Webview Preview Modal */}
      {previewLink && (
        <WebviewModal
          isOpen={previewLink !== null}
          onClose={() => setPreviewLink(null)}
          url={previewLink.url}
          title={previewLink.title}
        />
      )}
    </div>
  )
}
