export function extractDomain(url: string): string | null {
  try {
    const parsedUrl = new URL(url)
    const hostname = parsedUrl.hostname
    return hostname.replace(/^www\./, '')
  } catch {
    return null
  }
}

export async function scrapeTitle(url: string): Promise<string> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 5000)

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'KumpulinkBot/1.0',
      },
    })
    
    clearTimeout(timeoutId)

    if (!response.ok) {
      return url
    }

    const text = await response.text()
    const match = text.match(/<title[^>]*>([^<]*)<\/title>/i)

    if (match && match[1]) {
      // Decode HTML entities
      return match[1].trim() || url
    }

    return url
  } catch {
    clearTimeout(timeoutId)
    return url
  }
}
