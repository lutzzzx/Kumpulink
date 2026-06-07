'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { Chip } from '@/components/ui/Chip'
import { Tooltip } from '@/components/ui/Tooltip'
import { DeadLinkBadge } from '../DeadLinkBadge'
import styles from './LinkCard.module.css'

export type LinkItem = {
  id: string
  url: string
  title: string
  description: string | null
  faviconUrl: string | null
  isDead: boolean
  lastChecked: string | null
  httpStatus: number | null
  domain: {
    name: string
  }
}

export interface LinkCardProps {
  link: LinkItem
  onEdit: (link: LinkItem) => void
  onDelete: (linkId: string) => void
}

export function LinkCard({ link, onEdit, onDelete }: LinkCardProps): React.JSX.Element {
  const [menuOpen, setMenuOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }

    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [menuOpen])

  return (
    <Card variant="raised" interactive className={styles.card}>
      <div>
        <div className={styles.header}>
          <div className={styles.favicon}>
            {link.faviconUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={link.faviconUrl}
                alt=""
                className={styles.faviconImg}
                onError={(e) => {
                  // Fallback if google service favicon fails
                  ;(e.target as HTMLImageElement).src = `https://www.google.com/s2/favicons?domain=${link.domain.name}&sz=64`
                }}
              />
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
              </svg>
            )}
          </div>
          <div className={styles.titleContainer}>
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.titleLink}
            >
              {link.title}
            </a>
          </div>
          <div className={styles.menuContainer} ref={dropdownRef}>
            <button
              className={styles.kebabBtn}
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Link actions"
              aria-expanded={menuOpen}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="1"/>
                <circle cx="12" cy="5" r="1"/>
                <circle cx="12" cy="19" r="1"/>
              </svg>
            </button>
            {menuOpen && (
              <div className={styles.dropdown}>
                <button
                  className={`${styles.dropdownItem} ${styles.editItem}`}
                  onClick={() => {
                    setMenuOpen(false)
                    onEdit(link)
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                  Edit
                </button>
                <button
                  className={`${styles.dropdownItem} ${styles.deleteItem}`}
                  onClick={() => {
                    setMenuOpen(false)
                    onDelete(link.id)
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="3 6 5 6 21 6"/>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                    <line x1="10" y1="11" x2="10" y2="17"/>
                    <line x1="14" y1="11" x2="14" y2="17"/>
                  </svg>
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
        {link.description && <p className={styles.description}>{link.description}</p>}
      </div>
      <div className={styles.footer}>
        <span className={styles.domainName}>{link.domain.name}</span>
        <div className={styles.statusWrapper}>
          {link.isDead ? (
            <Tooltip content={`Last checked: ${link.lastChecked ? new Date(link.lastChecked).toLocaleString() : 'Never'}. HTTP Status: ${link.httpStatus || 'N/A'}`}>
              <div>
                <DeadLinkBadge />
              </div>
            </Tooltip>
          ) : link.lastChecked ? (
            <Tooltip content={`Last checked: ${new Date(link.lastChecked).toLocaleString()}. HTTP Status: ${link.httpStatus || 200}`}>
              <div>
                <Chip variant="status" statusType="complete">Online</Chip>
              </div>
            </Tooltip>
          ) : (
            <Tooltip content="This link has not been checked yet. Wait for cron or click verification in header.">
              <div>
                <Chip variant="status" statusType="in-review">Pending</Chip>
              </div>
            </Tooltip>
          )}
        </div>
      </div>
    </Card>
  )
}
