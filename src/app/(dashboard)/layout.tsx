import React from 'react'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
import styles from './layout.module.css'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default async function DashboardLayout({
  children
}: DashboardLayoutProps): Promise<React.JSX.Element> {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  const userName = session.user.name || session.user.email || 'User'

  return (
    <div className={styles.layoutWrapper}>
      <DashboardHeader userName={userName} />
      <div className={styles.contentWrapper}>
        {children}
      </div>
    </div>
  )
}
