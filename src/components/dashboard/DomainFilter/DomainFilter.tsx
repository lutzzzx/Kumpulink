'use client'

import React from 'react'
import Link from 'next/link'
import { Chip } from '@/components/ui/Chip'
import styles from './DomainFilter.module.css'

export type DomainFilterItem = {
  id: string
  name: string
  displayName: string
  faviconUrl: string | null
  _count?: {
    links: number
  }
}

export interface DomainFilterProps {
  domains: DomainFilterItem[]
  selectedDomain: string | null
  onSelect: (domainName: string | null) => void
  totalCount: number
  isArchive?: boolean
  forceVertical?: boolean
}

export function DomainFilter({
  domains,
  selectedDomain,
  onSelect,
  totalCount,
  isArchive = false,
  forceVertical = false
}: DomainFilterProps): React.JSX.Element {
  return (
    <div className={`${styles.filterContainer} ${forceVertical ? styles.forceVertical : ''}`}>
      <h3 className={styles.title}>Filter by Domain</h3>
      
      {/* Desktop Navigation List */}
      <nav className={styles.navList}>
        <button
          className={`${styles.navItem} ${selectedDomain === null ? styles.active : ''}`}
          onClick={() => onSelect(null)}
        >
          <span className={styles.navIcon}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="9"/>
              <rect x="14" y="3" width="7" height="5"/>
              <rect x="14" y="12" width="7" height="9"/>
              <rect x="3" y="16" width="7" height="5"/>
            </svg>
          </span>
          <span className={styles.navLabel}>{isArchive ? 'All Archived' : 'All Links'}</span>
          <span className={styles.navBadge}>{totalCount}</span>
        </button>

        {domains.map((domain) => {
          const count = domain._count?.links ?? 0
          return (
            <button
              key={domain.id}
              className={`${styles.navItem} ${selectedDomain === domain.name ? styles.active : ''}`}
              onClick={() => onSelect(domain.name)}
            >
              <span className={styles.faviconWrapper}>
                {domain.faviconUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={domain.faviconUrl}
                    alt=""
                    className={styles.navFavicon}
                    onError={(e) => {
                      ;(e.target as HTMLImageElement).src = `https://www.google.com/s2/favicons?domain=${domain.name}&sz=64`
                    }}
                  />
                ) : (
                  <span className={styles.navFaviconFallback}>
                    {domain.displayName.charAt(0).toUpperCase()}
                  </span>
                )}
              </span>
              <span className={styles.navLabel}>{domain.displayName}</span>
              <span className={styles.navBadge}>{count}</span>
            </button>
          )
        })}

        <div style={{ height: '1px', backgroundColor: 'var(--border-default)', margin: 'var(--space-2) 0' }} />

        {isArchive ? (
          <Link href="/dashboard" className={styles.navItem} style={{ textDecoration: 'none' }}>
            <span className={styles.navIcon}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
            </span>
            <span className={styles.navLabel} style={{ fontWeight: 600, color: 'var(--color-primary)' }}>
              Active Bookmarks
            </span>
          </Link>
        ) : (
          <Link href="/archive" className={styles.navItem} style={{ textDecoration: 'none' }}>
            <span className={styles.navIcon}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 8v13a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8"/>
                <polyline points="21 3 3 3 3 8 21 8"/>
                <line x1="10" y1="12" x2="14" y2="12"/>
              </svg>
            </span>
            <span className={styles.navLabel}>Archived Bookmarks</span>
          </Link>
        )}
      </nav>

      {/* Mobile Chips List */}
      <div className={styles.chipsList}>
        <Chip
          variant="filter"
          selected={selectedDomain === null}
          onClick={() => onSelect(null)}
        >
          All <span className={styles.count}>{totalCount}</span>
        </Chip>

        {domains.map((domain) => {
          const count = domain._count?.links ?? 0
          return (
            <Chip
              key={domain.id}
              variant="filter"
              selected={selectedDomain === domain.name}
              onClick={() => onSelect(domain.name)}
            >
              {domain.displayName} <span className={styles.count}>{count}</span>
            </Chip>
          )
        })}

        {isArchive ? (
          <Link href="/dashboard" style={{ textDecoration: 'none' }}>
            <Chip variant="filter" selected={false} onClick={() => {}}>
              Active Bookmarks
            </Chip>
          </Link>
        ) : (
          <Link href="/archive" style={{ textDecoration: 'none' }}>
            <Chip variant="filter" selected={false} onClick={() => {}}>
              Archive
            </Chip>
          </Link>
        )}
      </div>
    </div>
  )
}
