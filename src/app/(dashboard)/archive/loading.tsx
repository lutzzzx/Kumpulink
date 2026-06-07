import React from 'react'
import { Skeleton } from '@/components/ui/Skeleton'
import { DomainSectionSkeleton } from '@/components/dashboard/DomainSectionSkeleton'
import styles from '@/components/links/ArchiveClient/ArchiveClient.module.css'

export default function ArchiveLoading(): React.JSX.Element {
  const dummySidebarItems = Array.from({ length: 5 })

  return (
    <div className={styles.dashboardLayout}>
      {/* Sidebar Filter Skeleton */}
      <aside className={styles.sidebar}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
          <div style={{ marginBottom: '16px' }}>
            <Skeleton width="80px" height="12px" />
          </div>
          {dummySidebarItems.map((_, index) => (
            <div
              key={index}
              style={{
                display: 'flex',
                alignItems: 'center',
                height: '48px',
                padding: '0 var(--space-3)',
                borderRadius: 'var(--radius-md)',
                borderLeft: '3px solid transparent',
              }}
            >
              <Skeleton width="20px" height="20px" borderRadius="var(--radius-sm)" style={{ marginRight: '12px' }} />
              <Skeleton width="100px" height="14px" />
            </div>
          ))}
        </div>
      </aside>

      {/* Main Content Area Skeleton */}
      <main className={styles.mainContent}>
        {/* Toolbar Skeleton */}
        <div className={styles.toolbar}>
          <div style={{ flexGrow: 1, width: '100%' }}>
            <Skeleton height="40px" borderRadius="var(--radius-md)" />
          </div>
          <div className={styles.toolbarActions}>
            <Skeleton width="140px" height="40px" borderRadius="var(--radius-md)" />
          </div>
        </div>

        {/* 2 Dummy Domain Sections, each with 6 cards */}
        <DomainSectionSkeleton cardCount={6} />
        <DomainSectionSkeleton cardCount={6} />
      </main>
    </div>
  )
}
