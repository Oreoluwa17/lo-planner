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
  const { searchParams } = new URL(request.url)
  const action = searchParams.get('action')
  const res = await fetch(`${process.env.SHEETS_SCRIPT_URL}?action=${action}`, { cache: 'no-store' })
  const data = await res.json()
  return NextResponse.json(data)
}

export async function POST(request) {
  const user = getUser(request)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json()
  const res = await fetch(process.env.SHEETS_SCRIPT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...body, user }),
  })
  const data = await res.json()
  return NextResponse.json(data)
}
