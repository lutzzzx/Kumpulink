import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import styles from './layout.module.css'

export default function AuthLayout({
  children
}: {
  children: React.ReactNode
}): React.JSX.Element {
  return (
    <div className={styles.authContainer}>
      <div className={styles.leftPanel}>
        <div className={styles.leftContent}>
          <Link href="/" className={styles.logoLink}>
            <Image src="/logo.png" alt="Kumpulink Logo" className={styles.logoImg} width={40} height={40} priority />
            <span className={styles.logo}>Kumpulink</span>
          </Link>
          <h1 className={styles.tagline}>
            Your bookmarks, organized in seconds.
          </h1>
          <p className={styles.description}>
            Save links effortlessly. Kumpulink auto-groups by domain, fetches page details, and pings them to detect broken pages.
          </p>
        </div>
        <div className={styles.circle1} />
        <div className={styles.circle2} />
      </div>
      <div className={styles.rightPanel}>
        <div className={styles.formContainer}>
          {children}
        </div>
      </div>
    </div>
  )
}
