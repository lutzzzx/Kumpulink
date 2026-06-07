export async function register(): Promise<void> {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { startDeadLinkCron } = await import('./lib/cron')
    startDeadLinkCron()
  }
}
