'use client'

import React from 'react'
import { Button } from '@/components/ui/Button'
import styles from './BulkActionBar.module.css'

export interface BulkActionBarProps {
  selectedCount: number
  onDeselectAll: () => void
  onArchiveSelected: () => void
  onDeleteSelected: () => void
  isArchivedView?: boolean
  onUnarchiveSelected?: () => void
  isPending?: boolean
}

export function BulkActionBar({
  selectedCount,
  onDeselectAll,
  onArchiveSelected,
  onDeleteSelected,
  isArchivedView = false,
  onUnarchiveSelected,
  isPending = false,
}: BulkActionBarProps): React.JSX.Element {
  if (selectedCount === 0) return <></>

  return (
    <div className={styles.barContainer}>
      <div className={styles.infoSection}>
        <span className={styles.countText}>
          {selectedCount} {selectedCount === 1 ? 'bookmark' : 'bookmarks'} selected
        </span>
      </div>
      <div className={styles.actionSection}>
        <button
          type="button"
          onClick={onDeselectAll}
          className={styles.deselectBtn}
          disabled={isPending}
        >
          Deselect All
        </button>

        {isArchivedView ? (
          <Button
            variant="ghost"
            size="md"
            onClick={onUnarchiveSelected}
            disabled={isPending}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: 6 }}>
              <path d="M19 11H5m14 0a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-6a2 2 0 0 1 2-2m14 0V9a2 2 0 0 0-2-2M5 11V9a2 2 0 0 1 2-2m0 0V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2M7 7h10"/>
            </svg>
            Unarchive
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="md"
            onClick={onArchiveSelected}
            disabled={isPending}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: 6 }}>
              <path d="M21 8v13a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8"/>
              <polyline points="21 3 3 3 3 8 21 8"/>
              <line x1="10" y1="12" x2="14" y2="12"/>
            </svg>
            Archive
          </Button>
        )}

        <Button
          variant="destructive"
          size="md"
          onClick={onDeleteSelected}
          disabled={isPending}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: 6 }}>
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
          </svg>
          Delete
        </Button>
      </div>
    </div>
  )
}
