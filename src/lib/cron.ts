import cron from 'node-cron'
import { checkAllLinks } from './deadLinkChecker'

const CRON_INTERVAL = process.env.DEAD_LINK_CHECK_INTERVAL || '0 */6 * * *'

export function startDeadLinkCron(): void {
  console.log(`[Cron] Initializing Dead Link Checker cron job with interval: "${CRON_INTERVAL}"`)

  cron.schedule(CRON_INTERVAL, async () => {
    console.log('[Cron] Executing scheduled Dead Link Checker job...')
    const result = await checkAllLinks()
    console.log(`[Cron] Scheduled job finished. Checked: ${result.checked}, Dead: ${result.dead}`)
  })
}
