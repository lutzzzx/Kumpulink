'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useMobileUI } from '@/context/MobileUIContext'
import styles from './BottomNav.module.css'

export function BottomNav(): React.JSX.Element {
  const pathname = usePathname()
  const {
    filterSheetOpen,
    setFilterSheetOpen,
    setAddModalOpen,
    tagManagerOpen,
    setTagManagerOpen,
    closeAll
  } = useMobileUI()

  const handleNavClick = () => {
    closeAll()
  }

  const handleFilterToggle = (e: React.MouseEvent) => {
    e.preventDefault()
    setAddModalOpen(false)
    setTagManagerOpen(false)
    setFilterSheetOpen(!filterSheetOpen)
  }

  const handleTagsToggle = (e: React.MouseEvent) => {
    e.preventDefault()
    setAddModalOpen(false)
    setFilterSheetOpen(false)
    setTagManagerOpen(!tagManagerOpen)
  }

  const handleAddClick = (e: React.MouseEvent) => {
    e.preventDefault()
    closeAll()
    setAddModalOpen(true)
  }

  const isHomeActive = pathname === '/dashboard' && !filterSheetOpen && !tagManagerOpen
  const isArchiveActive = pathname === '/archive' && !filterSheetOpen && !tagManagerOpen

  return (
    <nav className={styles.bottomNav} aria-label="Mobile Navigation">
      <div className={styles.navContainer}>
        {/* Home */}
        <Link
          href="/dashboard"
          className={`${styles.navItem} ${isHomeActive ? styles.active : ''}`}
          onClick={handleNavClick}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
          <span className={styles.label}>Home</span>
        </Link>

        {/* Filter */}
        <button
          type="button"
          className={`${styles.navItem} ${filterSheetOpen ? styles.active : ''}`}
          onClick={handleFilterToggle}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
          </svg>
          <span className={styles.label}>Filter</span>
        </button>

        {/* FAB (Add) */}
        <div className={styles.fabWrapper}>
          <button
            type="button"
            className={styles.fab}
            onClick={handleAddClick}
            aria-label="Add new link"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
          </button>
        </div>

        {/* Tags */}
        <button
          type="button"
          className={`${styles.navItem} ${tagManagerOpen ? styles.active : ''}`}
          onClick={handleTagsToggle}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
            <line x1="7" y1="7" x2="7.01" y2="7"/>
          </svg>
          <span className={styles.label}>Tags</span>
        </button>

        {/* Archive */}
        <Link
          href="/archive"
          className={`${styles.navItem} ${isArchiveActive ? styles.active : ''}`}
          onClick={handleNavClick}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="21 8 21 21 3 21 3 8"/>
            <rect x="1" y="3" width="22" height="5"/>
            <line x1="10" y1="12" x2="14" y2="12"/>
          </svg>
          <span className={styles.label}>Archive</span>
        </Link>
      </div>
    </nav>
  )
}
