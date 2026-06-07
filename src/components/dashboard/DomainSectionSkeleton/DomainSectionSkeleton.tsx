import React from 'react'
import { Skeleton } from '@/components/ui/Skeleton'
import { LinkCardSkeleton } from '@/components/links/LinkCardSkeleton'
import clientStyles from '../DashboardClient/DashboardClient.module.css'
import styles from './DomainSectionSkeleton.module.css'

interface DomainSectionSkeletonProps {
  cardCount?: number
}

export function DomainSectionSkeleton({
  cardCount = 6,
}: DomainSectionSkeletonProps): React.JSX.Element {
  const dummyCards = Array.from({ length: cardCount })

  return (
    <div className={`${clientStyles.domainSection} ${styles.section}`}>
      <div className={clientStyles.domainHeader}>
        <div className={clientStyles.domainFavicon}>
          <Skeleton width="20px" height="20px" borderRadius="var(--radius-sm)" />
        </div>
        <div className={clientStyles.domainTitle} style={{ width: '150px' }}>
          <Skeleton height="24px" />
        </div>
      </div>
      <div className={clientStyles.linksGrid}>
        {dummyCards.map((_, index) => (
          <LinkCardSkeleton key={index} />
        ))}
      </div>
    </div>
  )
}
