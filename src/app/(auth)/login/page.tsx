import React from 'react'
import { LoginForm } from '@/components/auth/LoginForm'
import styles from './page.module.css'

export const metadata = {
  title: 'Login - Kumpulink',
  description: 'Log in to your Kumpulink account to manage your saved links.',
}

export default function LoginPage(): React.JSX.Element {
  return (
    <div className={styles.container}>
      <div className={styles.circle1} />
      <div className={styles.circle2} />
      <div className={styles.formWrapper}>
        <LoginForm />
      </div>
    </div>
  )
}
