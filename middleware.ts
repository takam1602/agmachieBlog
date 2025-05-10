import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  if (req.nextUrl.pathname.startsWith('/upload')) {
    const supaCookie = req.cookies.get('sb-access-token')
    if (!supaCookie) {
      const url = req.nextUrl.clone()
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }
  }
  return NextResponse.next()
}
