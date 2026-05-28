import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Read the HttpOnly cookies we set during login/register
  const userId = request.cookies.get('userId')?.value;
  const userRole = request.cookies.get('userRole')?.value;
  const { pathname } = request.nextUrl;

  // 1. Protect Patient Routes
  if (pathname.startsWith('/patient')) {
    if (!userId || userRole !== 'patient') {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
  }

  // 2. Protect Doctor Routes
  if (pathname.startsWith('/doctor')) {
    if (!userId || userRole !== 'doctor') {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
  }

  // 3. Prevent Logged-in Users from seeing Login/Register screens
  if ((pathname === '/auth/login' || pathname === '/auth/register') && userId) {
    const redirectPath = userRole === 'doctor' ? '/doctor/dashboard' : '/patient/dashboard';
    return NextResponse.redirect(new URL(redirectPath, request.url));
  }

  return NextResponse.next();
}

// Only run middleware on these specific routes to maintain performance
export const config = {
  matcher: ['/patient/:path*', '/doctor/:path*', '/auth/:path*'],
};