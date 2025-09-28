import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Only run middleware on specific protected routes
  const protectedRoutes = ['/dashboard', '/admin']
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
  
  // Skip middleware for all other routes to improve performance
  if (!isProtectedRoute) {
    return NextResponse.next()
  }

  // For now, just pass through - authentication can be added later if needed
  return NextResponse.next()
}

export const config = {
  matcher: [
    // Only run middleware on dashboard and admin routes
    '/dashboard/:path*',
    '/admin/:path*',
  ],
}
