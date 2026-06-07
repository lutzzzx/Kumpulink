import React from 'react'
import { Card } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'
import cardStyles from '../LinkCard/LinkCard.module.css'
import styles from './LinkCardSkeleton.module.css'

export function LinkCardSkeleton(): React.JSX.Element {
  return (
    <Card variant="raised" className={cardStyles.card}>
      <div>
        <div className={cardStyles.header}>
          <div className={cardStyles.favicon}>
            <Skeleton width="100%" height="100%" circle />
          </div>
          <div className={cardStyles.titleContainer}>
            <Skeleton width="85%" height="16px" style={{ marginBottom: '6px' }} />
            <Skeleton width="50%" height="12px" />
          </div>
        </div>

        <div className={styles.descriptionSkeleton}>
          <Skeleton width="100%" height="14px" style={{ marginBottom: '8px' }} />
          <Skeleton width="90%" height="14px" style={{ marginBottom: '8px' }} />
          <Skeleton width="60%" height="14px" />
        </div>
      </div>

      <div className={cardStyles.footer}>
        <Skeleton width="80px" height="20px" borderRadius="var(--radius-pill)" />
        <Skeleton width="60px" height="20px" borderRadius="var(--radius-pill)" />
      </div>
    </Card>
  )
}
