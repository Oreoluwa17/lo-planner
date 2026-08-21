import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

function getUser(request) {
  const token = request.cookies.get('lo-auth')?.value
  if (!token) return null
  const [, , name] = token.split('::')
  return name || 'Unknown'
}

export async function GET(request) {
  const user = getUser(request)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const url = process.env.RSVP_SCRIPT_URL
  if (!url) return NextResponse.json({ error: 'RSVP_SCRIPT_URL not configured' }, { status: 500 })

  const res = await fetch(`${url}?action=guests`, { cache: 'no-store' })
  const data = await res.json()
  return NextResponse.json(data)
}