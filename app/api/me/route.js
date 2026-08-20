import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

export async function GET() {
  const store = await cookies()
  const token = store.get('lo-auth')?.value
  if (!token) return NextResponse.json({ user: null })
  const [username, , name] = token.split('::')
  return NextResponse.json({ user: { username, name } })
}
