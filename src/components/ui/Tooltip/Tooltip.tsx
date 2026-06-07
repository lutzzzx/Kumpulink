import React from 'react'
import styles from './Tooltip.module.css'

export interface TooltipProps {
  content: string
  children: React.ReactNode
}

export function Tooltip({ content, children }: TooltipProps): React.JSX.Element {
  return (
    <div className={styles.tooltipWrapper}>
      {children}
      <div className={styles.tooltipBox}>
        {content}
      </div>
    </div>
  )
}
