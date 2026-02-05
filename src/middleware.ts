import { withAuth, NextRequestWithAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(request: NextRequestWithAuth) {
    const pathname = request.nextUrl.pathname;
    const userRole = request.nextauth.token?.role as string;

    // Protect /dashboard routes - only authenticated users
    if (pathname.startsWith('/dashboard')) {
      if (!request.nextauth.token) {
        return NextResponse.redirect(new URL('/login', request.url));
      }
    }

    // Protect /admin routes - only admins (except login page)
    if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
      if (!request.nextauth.token || userRole !== 'admin') {
        return NextResponse.redirect(new URL('/admin/login', request.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname;

        // Allow access to admin login page
        if (pathname === '/admin/login') {
          return true;
        }

        // Protect dashboard and admin routes
        if (pathname.startsWith('/dashboard') || pathname.startsWith('/admin')) {
          return !!token;
        }
        return true;
      },
    },
  }
);

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*'],
};
