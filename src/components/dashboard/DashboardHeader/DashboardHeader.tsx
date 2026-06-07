'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { AddLinkModal } from '@/components/links/AddLinkModal'
import { logoutUser } from '@/actions/auth.actions'
import { checkLinksAction } from '@/actions/link.actions'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { useMobileUI } from '@/context/MobileUIContext'
import styles from './DashboardHeader.module.css'

export interface DashboardHeaderProps {
  userName: string | null
}

export function DashboardHeader({ userName }: DashboardHeaderProps): React.JSX.Element {
  const { addModalOpen, setAddModalOpen } = useMobileUI()
  const [checking, setChecking] = useState(false)

  const handleLogout = async () => {
    await logoutUser()
  }

  const handleCheckLinks = async () => {
    setChecking(true)
    try {
      await checkLinksAction()
    } catch (err) {
      console.error(err)
    } finally {
      setChecking(false)
    }
  }

  return (
    <>
      <header className={styles.header}>
        <div className={styles.logoArea}>
          <a href="/dashboard" className={styles.logoLink}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="Kumpulink Logo" className={styles.logoImg} />
            <span className={styles.logoText}>Kumpulink</span>
          </a>
          <span className={styles.liveDot} title="Live Checker Active" />
        </div>
        <div className={styles.rightArea}>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCheckLinks}
            disabled={checking}
            className={styles.checkBtn}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
            </svg>
            <span className={styles.btnText}>{checking ? 'Checking...' : 'Check Status'}</span>
          </Button>
          <Button
            variant="primary"
            size="md"
            className={styles.addBtn}
            onClick={() => setAddModalOpen(true)}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Add Link
          </Button>
          <ThemeToggle />
          {userName && (
            <div className={styles.userProfile}>
              <div className={styles.avatar} title={`Logged in as ${userName}`}>
                {userName.charAt(0).toUpperCase()}
              </div>
              <span className={styles.userName} title={userName}>
                {userName}
              </span>
            </div>
          )}
          <button
            className={styles.logoutBtn}
            onClick={handleLogout}
            title="Sign Out"
            aria-label="Sign Out"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </button>
        </div>
      </header>

      <AddLinkModal isOpen={addModalOpen} onClose={() => setAddModalOpen(false)} />
    </>
  )
}
