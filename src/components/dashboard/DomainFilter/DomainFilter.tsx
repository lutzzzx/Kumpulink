'use client'

import React from 'react'
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
}

export function DomainFilter({
  domains,
  selectedDomain,
  onSelect,
  totalCount
}: DomainFilterProps): React.JSX.Element {
  return (
    <div className={styles.filterContainer}>
      <h3 className={styles.title}>Domains</h3>
      <div className={styles.chipsList}>
        <Chip
          variant="filter"
          selected={selectedDomain === null}
          onClick={() => onSelect(null)}
        >
          All Links <span className={styles.count}>({totalCount})</span>
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
              {domain.displayName}{' '}
              <span className={styles.count}>({count})</span>
            </Chip>
          )
        })}
      </div>
    </div>
  )
}
