import { db } from './db'
import pLimit from 'p-limit'

const BATCH_SIZE = process.env.DEAD_LINK_BATCH_SIZE
  ? parseInt(process.env.DEAD_LINK_BATCH_SIZE, 10)
  : 10

const TIMEOUT_MS = process.env.DEAD_LINK_TIMEOUT_MS
  ? parseInt(process.env.DEAD_LINK_TIMEOUT_MS, 10)
  : 8000

export type CheckResult = {
  linkId: string
  url: string
  isDead: boolean
  httpStatus: number | null
}

async function checkSingleLink(linkId: string, url: string): Promise<CheckResult> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS)

  try {
    const response = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
      headers: {
        'User-Agent': 'KumpulinkDeadLinkChecker/1.0',
      },
      redirect: 'follow',
    })

    clearTimeout(timeoutId)

    const isDead = response.status >= 400
    return {
      linkId,
      url,
      isDead,
      httpStatus: response.status,
    }
  } catch {
    clearTimeout(timeoutId)
    // Network errors, timeouts, or DNS failures mean isDead = true
    return {
      linkId,
      url,
      isDead: true,
      httpStatus: null,
    }
  }
}

export async function checkAllLinks(): Promise<{ checked: number; dead: number }> {
  try {
    // Get links to check: check everything to keep simple, or links older than 6 hours
    const links = await db.link.findMany({
      select: {
        id: true,
        url: true,
      },
    })

    if (links.length === 0) {
      return { checked: 0, dead: 0 }
    }

    const limit = pLimit(BATCH_SIZE)
    const tasks = links.map((link) =>
      limit(() => checkSingleLink(link.id, link.url))
    )

    const results = await Promise.all(tasks)

    let deadCount = 0

    // Write results to database
    await db.$transaction(
      results.map((result) => {
        if (result.isDead) deadCount++
        return db.link.update({
          where: { id: result.linkId },
          data: {
            isDead: result.isDead,
            httpStatus: result.httpStatus,
            lastChecked: new Date(),
          },
        })
      })
    )

    console.log(`[DeadLinkChecker] Checked ${links.length} links. Found ${deadCount} dead links.`)
    return { checked: links.length, dead: deadCount }
  } catch (error) {
    console.error('[DeadLinkChecker] Error running checkAllLinks:', error)
    return { checked: 0, dead: 0 }
  }
}
