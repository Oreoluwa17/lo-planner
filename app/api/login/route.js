import { NextResponse } from 'next/server'

const USERS = {
  ore:     { name: 'Oreoluwa', password: process.env.PASSWORD_OREOLUWA },
  londiwe: { name: 'Londiwe',  password: process.env.PASSWORD_LONDIWE  },
}

export async function POST(request) {
  const { username, password } = await request.json()
  const user = USERS[username?.toLowerCase()]
  if (!user || !user.password || password !== user.password) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
  }
  const res = NextResponse.json({ success: true, name: user.name })
  res.cookies.set('lo-auth', `${username}::${user.name}`, {
    httpOnly: true, secure: true, sameSite: 'lax', maxAge: 60 * 60 * 24 * 30,
  })
  return res
}
