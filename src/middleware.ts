import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

// Define protected routes
const protectedRoutes = ['/dashboard', '/admin'];

// Public routes that don't need auth
const publicRoutes = ['/', '/login', '/signup', '/pricing', '/tools', '/services', '/about', '/contact', '/gallery', '/team', '/awards', '/publications'];

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  // Check if it's a protected route
  const isProtected = protectedRoutes.some(route => pathname.startsWith(route));

  if (isProtected) {
    // Check for JWT token in cookies
    const accessToken = req.cookies.get('accessToken')?.value;

    if (!accessToken) {
      // Redirect to login if no token
      return NextResponse.redirect(new URL('/login', req.url));
    }

    // Verify JWT token
    try {
      const secret = process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET;
      if (!secret) {
        return NextResponse.redirect(new URL('/login', req.url));
      }

      const decoded = jwt.verify(accessToken, secret) as any;

      if (decoded.type !== 'access') {
        return NextResponse.redirect(new URL('/login', req.url));
      }

      // For admin routes, check role
      if (pathname.startsWith('/admin')) {
        if (decoded.role !== 'admin') {
          return NextResponse.redirect(new URL('/dashboard', req.url));
        }
      }
    } catch (error) {
      console.error('Token verification failed:', error);
      return NextResponse.redirect(new URL('/login', req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  runtime: 'nodejs',
  matcher: [
    // Match all paths except Next.js internals and static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
