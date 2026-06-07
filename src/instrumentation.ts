export async function register(): Promise<void> {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const isDev = process.env.NODE_ENV === 'development'
    const enableLocalCron = process.env.ENABLE_LOCAL_CRON === 'true'

    if (isDev || enableLocalCron) {
      const { startDeadLinkCron } = await import('./lib/cron')
      startDeadLinkCron()
    } else {
      console.log('[Cron] Local node-cron checker is disabled (Production/Serverless mode).')
    }
  }
}
