import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Define protected routes
const protectedRoutes = ['/dashboard', '/admin'];

// Public routes that don't need auth
const publicRoutes = ['/', '/login', '/signup', '/admin/login', '/pricing', '/tools', '/services', '/about', '/contact', '/gallery', '/team', '/awards', '/publications'];

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  // Check if it's a public route first
  const isPublic = publicRoutes.includes(pathname);
  if (isPublic) {
    return NextResponse.next();
  }

  // Check if it's a protected route
  const isProtected = protectedRoutes.some(route => pathname.startsWith(route));

  if (isProtected) {
    // Check for login_success flag (recent login)
    const loginSuccess = req.cookies.get('login_success')?.value;
    
    // Use NextAuth's getToken to check session
    const token = await getToken({ 
      req, 
      secret: process.env.NEXTAUTH_SECRET 
    });

    console.log(`[Middleware] ${pathname} - Token exists:`, !!token, ', Recent login:', !!loginSuccess);

    // Allow if:
    // 1. Valid NextAuth token, OR
    // 2. Recent login flag is set (client just logged in)
    if (!token && !loginSuccess) {
      console.log(`[Middleware] No token/login for ${pathname}, redirecting to /login`);
      return NextResponse.redirect(new URL('/login', req.url));
    }

    // For admin routes, check role
    if (pathname.startsWith('/admin')) {
      if (token && token.role !== 'admin') {
        console.log(`[Middleware] Non-admin user trying to access /admin, redirecting to /dashboard`);
        return NextResponse.redirect(new URL('/dashboard', req.url));
      }
    }

    console.log(`[Middleware] Allowing access to ${pathname}`);
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
