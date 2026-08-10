import { NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function proxy(request) {
  const { pathname } = request.nextUrl
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })

  const isPublic = pathname.startsWith('/login') || pathname.startsWith('/api/auth')
  if (!token && !isPublic) return NextResponse.redirect(new URL('/login', request.url))
  if (token && pathname === '/login') return NextResponse.redirect(new URL('/dashboard', request.url))
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
