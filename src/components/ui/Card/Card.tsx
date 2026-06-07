import React, { type HTMLAttributes } from 'react'
import styles from './Card.module.css'

export type CardVariant = 'raised' | 'glass'

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant
  interactive?: boolean
  children: React.ReactNode
}

export function Card({
  variant = 'raised',
  interactive = false,
  children,
  className = '',
  ...props
}: CardProps): React.JSX.Element {
  const cardClass = [
    styles.card,
    styles[variant],
    interactive ? styles.interactive : '',
    className
  ].filter(Boolean).join(' ')

  return (
    <div className={cardClass} {...props}>
      {children}
    </div>
  )
}
