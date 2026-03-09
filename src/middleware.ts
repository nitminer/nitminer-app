import { NextRequest, NextResponse } from 'next/server';

// Define protected routes
const protectedRoutes = ['/dashboard', '/admin'];

// Public routes that don't need auth
const publicRoutes = ['/', '/login', '/signup', '/login', '/pricing', '/tools', '/services', '/about', '/about-us', '/contact', '/gallery', '/team', '/awards', '/publications', '/admin/login'];

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  const host = req.headers.get('host') || '';
  const protocol = req.headers.get('x-forwarded-proto') || 'https';
  
  // Redirect nitminer.com to www.nitminer.com
  const hostWithoutPort = host.split(':')[0];
  if (hostWithoutPort === 'nitminer.com') {
    return NextResponse.redirect(`${protocol}://www.nitminer.com${pathname}`);
  }

  // Check if it's a public route first
  const isPublic = publicRoutes.includes(pathname);
  if (isPublic) {
    return NextResponse.next();
  }

  // Check if it's a protected route
  const isProtected = protectedRoutes.some(route => pathname.startsWith(route));

  if (isProtected) {
    // Check for NextAuth session token cookie
    // In Next.js 13+ App Router, the session token is stored in 'next-auth.session-token' cookie
    const sessionToken = req.cookies.get('next-auth.session-token')?.value;
    const loginSuccess = req.cookies.get('login_success')?.value;
    
    // Check for authorization header as fallback (for mobile/API-based session handling)
    const authHeader = req.headers.get('authorization');
    const hasAuthHeader = !!authHeader;
    
    console.log(`[Middleware] ${pathname} - Session token exists:`, !!sessionToken, ', Recent login:', !!loginSuccess, ', Auth header:', hasAuthHeader);

    // Allow if:
    // 1. Valid NextAuth session token exists, OR
    // 2. Recent login flag is set (client just logged in), OR
    // 3. Authorization header present (API/mobile fallback)
    if (!sessionToken && !loginSuccess && !hasAuthHeader) {
      console.log(`[Middleware] No session for ${pathname}, redirecting to /login`);
      return NextResponse.redirect(new URL('/login', req.url));
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
