import { NextResponse } from 'next/server'

export async function proxy(request) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get('lo-auth')?.value
  const isPublic = pathname === '/login' || pathname.startsWith('/api/login') || pathname.startsWith('/_next')
  if (!token && !isPublic) return NextResponse.redirect(new URL('/login', request.url))
  if (token && pathname === '/login') return NextResponse.redirect(new URL('/dashboard', request.url))
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
