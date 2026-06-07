'use client'

import React, { useState } from 'react'
import { createPortal } from 'react-dom'
import styles from './WebviewModal.module.css'

export interface WebviewModalProps {
  isOpen: boolean
  onClose: () => void
  url: string
  title: string
}

export function WebviewModal({
  isOpen,
  onClose,
  url,
  title,
}: WebviewModalProps): React.JSX.Element | null {
  const [copied, setCopied] = useState(false)

  if (!isOpen) return null

  const handleCopy = () => {
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return createPortal(
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.container} role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        {/* Header Bar */}
        <div className={styles.header}>
          <div className={styles.info}>
            <span className={styles.title} title={title}>{title}</span>
            <span className={styles.url} title={url}>{url}</span>
          </div>
          
          <div className={styles.actions}>
            {/* Copy Link */}
            <button
              onClick={handleCopy}
              className={styles.actionBtn}
              title="Copy URL"
              aria-label="Copy URL"
            >
              {copied ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-success)" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                </svg>
              )}
            </button>

            {/* Open in New Tab */}
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.actionBtn}
              title="Open in new tab"
              aria-label="Open in new tab"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                <polyline points="15 3 21 3 21 9"/>
                <line x1="10" y1="14" x2="21" y2="3"/>
              </svg>
            </a>

            {/* Divider */}
            <div className={styles.divider} />

            {/* Close */}
            <button
              onClick={onClose}
              className={`${styles.actionBtn} ${styles.closeBtn}`}
              title="Close preview"
              aria-label="Close preview"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Warning Banner */}
        <div className={styles.banner}>
          <span>Is the preview blank? Some sites block embedding. </span>
          <a href={url} target="_blank" rel="noopener noreferrer" className={styles.bannerLink}>
            Open externally
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginLeft: 4 }}>
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
              <polyline points="15 3 21 3 21 9"/>
              <line x1="10" y1="14" x2="21" y2="3"/>
            </svg>
          </a>
        </div>

        {/* Iframe content */}
        <div className={styles.webviewBody}>
          <iframe
            src={url}
            title={title}
            className={styles.iframe}
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          />
        </div>
      </div>
    </div>,
    document.body
  )
}
