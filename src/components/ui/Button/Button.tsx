import React, { type ButtonHTMLAttributes } from 'react'
import styles from './Button.module.css'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive'
export type ButtonSize = 'sm' | 'md' | 'lg'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  children: React.ReactNode
}

export function Button({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps): React.JSX.Element {
  const buttonClass = [
    styles.btn,
    styles[variant],
    styles[size],
    className
  ].filter(Boolean).join(' ')

  return (
    <button
      className={buttonClass}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}
