import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { checkAllLinks } from '@/lib/deadLinkChecker'

export async function POST(): Promise<NextResponse> {
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 })
  }

  try {
    const result = await checkAllLinks()
    return NextResponse.json({
      success: true,
      message: `Checked ${result.checked} links. Found ${result.dead} dead links.`,
      data: result,
    })
  } catch (error) {
    console.error('Trigger check links API error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
