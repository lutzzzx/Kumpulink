import React from 'react'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import styles from './page.module.css'

export const metadata = {
  title: 'Kumpulink - Self-Hosted Bookmarking App',
  description: 'A personal bookmarking app with automatic domain grouping and dead link checks.',
}

export default async function LandingPage(): Promise<React.JSX.Element> {
  const session = await auth()

  if (session?.user) {
    redirect('/dashboard')
  }

  return (
    <div className={styles.container}>
      <div className={styles.circle1} />

      <nav className={styles.nav}>
        <div className={styles.logoContainer}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Kumpulink Logo" className={styles.logoImg} />
          <span className={styles.logo}>Kumpulink</span>
        </div>
        <div className={styles.navLinks}>
          <Link href="/login" passHref className={styles.linkWrapper}>
            <Button variant="ghost" size="sm">Sign In</Button>
          </Link>
          <Link href="/register" passHref className={styles.linkWrapper}>
            <Button variant="primary" size="sm">Get Started</Button>
          </Link>
        </div>
      </nav>

      <main className={styles.hero}>
        <h1 className={`${styles.title} text-hero`}>
          Your Bookmarks, <br />
          <span className={styles.accent}>Automated.</span>
        </h1>
        <p className={styles.subtitle}>
          Save links with zero effort. They get grouped by domain automatically, and we verify their health periodically.
        </p>

        <div className={styles.ctaButtons}>
          <Link href="/register" passHref className={styles.linkWrapper}>
            <Button variant="primary" size="lg">Create Free Account</Button>
          </Link>
          <Link href="/login" passHref className={styles.linkWrapper}>
            <Button variant="secondary" size="lg">Sign In</Button>
          </Link>
        </div>

        <div className={styles.featuresGrid}>
          <Card variant="raised" className={styles.featureCard}>
            <h3 className={styles.featureTitle}>
              <span className={styles.featureIcon}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                </svg>
              </span>
              Frictionless Saving
            </h3>
            <p className={styles.featureDesc}>
              Just paste a URL. We scrape the page titles and resolve favicons automatically on our server.
            </p>
          </Card>

          <Card variant="raised" className={styles.featureCard}>
            <h3 className={styles.featureTitle}>
              <span className={styles.featureIcon}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
                </svg>
              </span>
              Auto Grouping
            </h3>
            <p className={styles.featureDesc}>
              No manual categorization needed. Links are grouped by domain name automatically.
            </p>
          </Card>

          <Card variant="raised" className={styles.featureCard}>
            <h3 className={styles.featureTitle}>
              <span className={styles.featureIcon}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                </svg>
              </span>
              Dead Link Checker
            </h3>
            <p className={styles.featureDesc}>
              Our background cron job periodically pings your links and flags broken ones visually.
            </p>
          </Card>
        </div>
      </main>
    </div>
  )
}
