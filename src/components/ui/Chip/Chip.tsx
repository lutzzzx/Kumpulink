import React, { type HTMLAttributes } from 'react'
import styles from './Chip.module.css'

export type ChipVariant = 'filter' | 'status'
export type ChipStatusType = 'active' | 'complete' | 'in-review' | 'archived' | 'dead'

export interface ChipProps extends HTMLAttributes<HTMLDivElement> {
  variant?: ChipVariant
  selected?: boolean // Used for filter variant
  statusType?: ChipStatusType // Used for status variant
  children: React.ReactNode
}

export function Chip({
  variant = 'filter',
  selected = false,
  statusType = 'active',
  children,
  className = '',
  onClick,
  ...props
}: ChipProps): React.JSX.Element {
  const isFilter = variant === 'filter'

  const chipClass = [
    styles.chip,
    isFilter
      ? (selected ? styles.filterSelected : styles.filter)
      : `${styles.status} ${styles[`status-${statusType}`]}`,
    className
  ].filter(Boolean).join(' ')

  const renderIcon = (): React.JSX.Element | null => {
    if (isFilter) return null

    switch (statusType) {
      case 'active':
        return <span className={`${styles.dot} ${styles.pulseDot}`} />
      case 'complete':
        return (
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )
      case 'in-review':
        return (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
          </svg>
        )
      case 'archived':
        return (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="21 8 21 21 3 21 3 8"/>
            <rect x="1" y="3" width="22" height="5"/>
            <line x1="10" y1="12" x2="14" y2="12"/>
          </svg>
        )
      case 'dead':
        return (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
            <line x1="12" y1="9" x2="12" y2="13"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
        )
      default:
        return null
    }
  }

  return (
    <div
      className={chipClass}
      onClick={isFilter ? onClick : undefined}
      style={isFilter && onClick ? { cursor: 'pointer' } : undefined}
      role={isFilter ? 'button' : undefined}
      tabIndex={isFilter && onClick ? 0 : undefined}
      onKeyDown={
        isFilter && onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onClick(e as unknown as React.MouseEvent<HTMLDivElement>)
              }
            }
          : undefined
      }
      {...props}
    >
      {renderIcon()}
      <span>{children}</span>
    </div>
  )
}
