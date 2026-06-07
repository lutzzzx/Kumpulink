import React from 'react'
import { RegisterForm } from '@/components/auth/RegisterForm'
import styles from './page.module.css'

export const metadata = {
  title: 'Register - Kumpulink',
  description: 'Create a Kumpulink account to start saving and auto-grouping links.',
}

export default function RegisterPage(): React.JSX.Element {
  return (
    <div className={styles.container}>
      <div className={styles.circle1} />
      <div className={styles.circle2} />
      <div className={styles.formWrapper}>
        <RegisterForm />
      </div>
    </div>
  )
}
