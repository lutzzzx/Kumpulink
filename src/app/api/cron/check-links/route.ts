import { NextResponse } from 'next/server'
import { checkAllLinks } from '@/lib/deadLinkChecker'

export async function GET(request: Request): Promise<NextResponse> {
  const authHeader = request.headers.get('authorization')
  
  // Verify authorization header matches CRON_SECRET
  const cronSecret = process.env.CRON_SECRET
  
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const result = await checkAllLinks()
    return NextResponse.json({
      success: true,
      message: `Checked ${result.checked} links. Found ${result.dead} dead links.`,
      data: result,
    })
  } catch (error) {
    console.error('Vercel Cron check links error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
