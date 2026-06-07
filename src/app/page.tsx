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
      {/* Background elements */}
      <div className={styles.circle1} />
      <div className={styles.circle2} />

      {/* Header / Nav */}
      <header className={styles.header}>
        <nav className={styles.nav}>
          <div className={styles.logoContainer}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="Kumpulink Logo" className={styles.logoImg} />
            <span className={styles.logo}>Kumpulink</span>
          </div>
          <div className={styles.navLinks}>
            <Link href="#features" className={styles.navLink}>Features</Link>
            <Link href="#faq" className={styles.navLink}>FAQ</Link>
            <Link href="/login" passHref className={styles.linkWrapper}>
              <Button variant="ghost" size="sm">Sign In</Button>
            </Link>
            <Link href="/register" passHref className={styles.linkWrapper}>
              <Button variant="primary" size="sm">Get Started</Button>
            </Link>
          </div>
        </nav>
      </header>

      <main className={styles.main}>
        {/* Hero Section */}
        <section className={styles.hero}>
          <div className={styles.heroBadge}>✨ The open-source bookmark manager</div>
          <h1 className={`${styles.title} text-hero`}>
            Your Bookmarks, <br />
            <span className={styles.accent}>Automated.</span>
          </h1>
          <p className={styles.subtitle}>
            Save links with zero effort. We automatically fetch titles, icons, group them by domain, and check if they are still alive. 
          </p>

          <div className={styles.ctaButtons}>
            <Link href="/register" passHref className={styles.linkWrapper}>
              <Button variant="primary" size="lg">Create Free Account</Button>
            </Link>
            <Link href="https://github.com/lutzzzx/Kumpulink" target="_blank" rel="noopener noreferrer" passHref className={styles.linkWrapper}>
              <Button variant="secondary" size="lg">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: 8}}>
                  <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
                </svg>
                View on GitHub
              </Button>
            </Link>
          </div>
        </section>

        {/* App Preview Mockup */}
        <section className={styles.previewSection}>
          <div className={styles.mockupContainer}>
            <div className={styles.mockupWindow}>
              {/* Fake Browser Topbar */}
              <div className={styles.mockupHeader}>
                <div className={styles.macButtons}>
                  <span className={styles.macRed} />
                  <span className={styles.macYellow} />
                  <span className={styles.macGreen} />
                </div>
                <div className={styles.mockupUrl}>kumpulink.local/dashboard</div>
              </div>
              
              {/* Fake App UI */}
              <div className={styles.mockupBody}>
                {/* Sidebar */}
                <div className={styles.mockupSidebar}>
                  <div className={styles.mockupLogoBar}>
                    <div className={styles.mockupLogoIcon} />
                    <div className={styles.mockupLogoText} />
                  </div>
                  <div className={styles.mockupMenu}>
                    <div className={`${styles.mockupMenuItem} ${styles.activeMenuItem}`}>
                      <div className={styles.mockupMenuIcon} />
                      <div className={styles.mockupMenuText} />
                    </div>
                    <div className={styles.mockupMenuItem}>
                      <div className={styles.mockupMenuIcon} />
                      <div className={styles.mockupMenuText} style={{ width: '40%' }}/>
                    </div>
                    <div className={styles.mockupMenuItem}>
                      <div className={styles.mockupMenuIcon} />
                      <div className={styles.mockupMenuText} style={{ width: '60%' }}/>
                    </div>
                  </div>
                </div>

                {/* Main Content */}
                <div className={styles.mockupContent}>
                  <div className={styles.mockupTopbar}>
                    <div className={styles.mockupSearch} />
                    <div className={styles.mockupAddBtn} />
                  </div>
                  
                  {/* Cards Grid */}
                  <div className={styles.mockupGrid}>
                    {[1, 2, 3, 4, 5, 6].map(i => (
                      <div key={i} className={styles.mockCard}>
                        <div className={styles.mockCardIcon} />
                        <div className={styles.mockCardLines}>
                          <div className={styles.mockCardLine1} style={{ width: `${Math.floor(Math.random() * 40) + 40}%`}} />
                          <div className={styles.mockCardLine2} style={{ width: `${Math.floor(Math.random() * 30) + 30}%`}} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Decorative Glow behind mockup */}
            <div className={styles.mockupGlow} />
          </div>
        </section>

        {/* Detailed Features */}
        <section className={styles.featuresSection} id="features">
          <div className={styles.sectionHeader}>
            <h2 className={`text-h2 ${styles.sectionTitle}`}>Everything you need, nothing you don't.</h2>
            <p className={styles.sectionSubtitle}>Built to solve the problem of digital hoarding. It just works.</p>
          </div>

          <div className={styles.featuresGrid}>
            <Card variant="raised" className={styles.featureCard}>
              <div className={styles.featureIconWrapper}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                </svg>
              </div>
              <h3 className={styles.featureTitle}>Frictionless Saving</h3>
              <p className={styles.featureDesc}>
                Paste a URL and you're done. We automatically scrape the page title, description, and high-resolution favicon for you.
              </p>
            </Card>

            <Card variant="raised" className={styles.featureCard}>
              <div className={styles.featureIconWrapper}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
                </svg>
              </div>
              <h3 className={styles.featureTitle}>Auto Grouping</h3>
              <p className={styles.featureDesc}>
                No more manual tagging or folder creation. Links are grouped beautifully by their domain name automatically.
              </p>
            </Card>

            <Card variant="raised" className={styles.featureCard}>
              <div className={styles.featureIconWrapper}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                </svg>
              </div>
              <h3 className={styles.featureTitle}>Dead Link Checker</h3>
              <p className={styles.featureDesc}>
                Links rot over time. Our background cron job routinely checks your bookmarks and visually flags broken or unreachable pages.
              </p>
            </Card>

            <Card variant="raised" className={styles.featureCard}>
              <div className={styles.featureIconWrapper}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </div>
              <h3 className={styles.featureTitle}>Self-Hosted Privacy</h3>
              <p className={styles.featureDesc}>
                Your data, your rules. Keep your links private with an isolated PostgreSQL database and JWT-based authentication.
              </p>
            </Card>

            <Card variant="raised" className={styles.featureCard}>
              <div className={styles.featureIconWrapper}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                  <line x1="8" y1="21" x2="16" y2="21"/>
                  <line x1="12" y1="17" x2="12" y2="21"/>
                </svg>
              </div>
              <h3 className={styles.featureTitle}>Built-in Webview</h3>
              <p className={styles.featureDesc}>
                Read articles or watch videos directly within the app using the fast, integrated webview without losing your context.
              </p>
            </Card>

            <Card variant="raised" className={styles.featureCard}>
              <div className={styles.featureIconWrapper}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7 10 12 15 17 10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
              </div>
              <h3 className={styles.featureTitle}>Installable PWA</h3>
              <p className={styles.featureDesc}>
                Access Kumpulink natively on your mobile phone or desktop via a smooth Progressive Web App experience.
              </p>
            </Card>
          </div>
        </section>

        {/* FAQ Section */}
        <section className={styles.faqSection} id="faq">
          <div className={styles.sectionHeader}>
            <h2 className={`text-h2 ${styles.sectionTitle}`}>Frequently Asked Questions</h2>
          </div>
          
          <div className={styles.faqList}>
            <details className={styles.faqItem}>
              <summary className={styles.faqSummary}>
                Is Kumpulink completely free?
                <span className={styles.faqIcon}>+</span>
              </summary>
              <div className={styles.faqContent}>
                Yes, Kumpulink is 100% open-source and free to self-host. You can deploy it on your own server or using services like Vercel and Supabase at no cost.
              </div>
            </details>

            <details className={styles.faqItem}>
              <summary className={styles.faqSummary}>
                How does the auto-grouping work?
                <span className={styles.faqIcon}>+</span>
              </summary>
              <div className={styles.faqContent}>
                When you save a link, the backend automatically parses the URL, extracts the hostname (e.g., youtube.com, github.com), and visually groups identical domains together on your dashboard.
              </div>
            </details>

            <details className={styles.faqItem}>
              <summary className={styles.faqSummary}>
                Will my links be visible to others?
                <span className={styles.faqIcon}>+</span>
              </summary>
              <div className={styles.faqContent}>
                No. Kumpulink features a built-in authentication system. All links you save are strictly isolated to your user account and cannot be seen by anyone else.
              </div>
            </details>

            <details className={styles.faqItem}>
              <summary className={styles.faqSummary}>
                Can I import links from other apps?
                <span className={styles.faqIcon}>+</span>
              </summary>
              <div className={styles.faqContent}>
                Currently, Kumpulink is focused on saving new links. Bulk import from browsers or services like Pocket is planned for a future update.
              </div>
            </details>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.footerBrand}>
            <div className={styles.logoContainer}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.png" alt="Kumpulink Logo" className={styles.logoImg} />
              <span className={styles.logo}>Kumpulink</span>
            </div>
            <p className={styles.footerDesc}>The personal, frictionless bookmark manager.</p>
          </div>
          
          <div className={styles.footerLinks}>
            <div className={styles.footerColumn}>
              <h4>Product</h4>
              <Link href="#features">Features</Link>
              <Link href="#faq">FAQ</Link>
            </div>
            <div className={styles.footerColumn}>
              <h4>Open Source</h4>
              <a href="https://github.com/lutzzzx/Kumpulink" target="_blank" rel="noopener noreferrer">GitHub</a>
              <a href="https://github.com/lutzzzx/Kumpulink/issues" target="_blank" rel="noopener noreferrer">Issues</a>
            </div>
          </div>
        </div>
        <div className={styles.footerBottom}>
          <p>© {new Date().getFullYear()} Kumpulink. Open source under the MIT License.</p>
        </div>
      </footer>
    </div>
  )
}
