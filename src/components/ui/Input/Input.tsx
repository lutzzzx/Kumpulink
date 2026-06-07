import React, { type InputHTMLAttributes, forwardRef } from 'react'
import styles from './Input.module.css'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', ...props }, ref): React.JSX.Element => {
    const inputClass = [
      styles.input,
      error ? styles.errorInput : '',
      className
    ].filter(Boolean).join(' ')

    return (
      <div className={styles.inputContainer}>
        {label && <label className={styles.label}>{label}</label>}
        <input ref={ref} className={inputClass} {...props} />
        {error && <span className={styles.errorMessage}>{error}</span>}
      </div>
    )
  }
)

Input.displayName = 'Input'
