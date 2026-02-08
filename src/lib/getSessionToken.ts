import { getToken as getNextAuthToken } from 'next-auth/jwt';
import { NextRequest } from 'next/server';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

/**
 * Get the NextAuth JWT token from request
 * Uses the authOptions configuration to ensure proper decryption
 */
export async function getSessionToken(req: NextRequest) {
  try {
    const secret = (authOptions.jwt as any)?.secret || process.env.NEXTAUTH_SECRET;
    
    // Try to get the raw cookie header
    const cookieHeader = req.headers.get('cookie') || '';
    const sessionCookie = cookieHeader
      .split(';')
      .find(c => c.trim().startsWith('next-auth.session-token='));
    
    const cookieValue = sessionCookie ? sessionCookie.split('=')[1]?.trim() : null;
    
    console.log('[getSessionToken] Cookie details:', {
      hasCookie: !!cookieValue,
      cookieLength: cookieValue?.length,
      cookieStart: cookieValue?.substring(0, 20),
      cookieEnd: cookieValue?.substring(cookieValue.length - 20),
    });
    
    console.log('[getSessionToken] Using secret:', {
      hasSecret: !!secret,
      secretLength: secret?.length,
      secretStart: secret?.substring(0, 10),
      fromAuthOptions: !!(authOptions.jwt as any)?.secret,
    });
    
    const token = await getNextAuthToken({
      req,
      secret,
    });

    console.log('[getSessionToken] Token result:', { hasToken: !!token, tokenKeys: token ? Object.keys(token) : [] });
    return token;
  } catch (error) {
    console.error('[getSessionToken] Error:', error);
    return null;
  }
}
