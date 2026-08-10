import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/route'

export const dynamic = 'force-dynamic'

const URL_ = () => process.env.SHEETS_SCRIPT_URL

export async function GET(request) {
  const session = await getServerSession(authOptions)
  if (!session) return Response.json({ error:'Unauthorized' }, { status:401 })
  const { searchParams } = new URL(request.url)
  const action = searchParams.get('action')
  const res = await fetch(`${URL_()}?action=${action}`, { cache:'no-store' })
  const data = await res.json()
  return Response.json(data)
}

export async function POST(request) {
  const session = await getServerSession(authOptions)
  if (!session) return Response.json({ error:'Unauthorized' }, { status:401 })
  const body = await request.json()
  const res = await fetch(URL_(), {
    method:'POST',
    headers:{ 'Content-Type':'application/json' },
    body: JSON.stringify({ ...body, user:session.user.name }),
  })
  const data = await res.json()
  return Response.json(data)
}
