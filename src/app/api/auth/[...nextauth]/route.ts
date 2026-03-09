import NextAuth, { type NextAuthOptions, type DefaultSession } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/dbConnect';
import { User } from '@/models/User';

declare module 'next-auth' {
  interface Session extends DefaultSession {
    user: {
      id: string;
      role: string;
      isPremium?: boolean;
      trialCount?: number;
    } & DefaultSession['user'];
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string;
    role?: string;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        try {
          console.log('Authorize called with:', { email: credentials?.email, username: credentials?.username, hasPassword: !!credentials?.password });
          
          // Check for either email or username
          if (!credentials?.password || (!credentials?.email && !credentials?.username)) {
            console.log('Missing credentials');
            throw new Error('Email/username and password are required');
          }

          // Demo admin credentials - no database required
          if (credentials.email?.toLowerCase() === 'admin@nitminer.com' && credentials.password === '12345678') {
            console.log('Admin login successful');
            return {
              id: 'admin',
              email: 'admin@nitminer.com',
              name: 'Administrator',
              firstName: 'Admin',
              lastName: 'User',
              role: 'admin',
            };
          }

          console.log('Regular user login');
          await dbConnect();

          // Find user by email or username
          let user;
          if (credentials.email) {
            user = await User.findOne({ email: credentials.email.toLowerCase() }).select('+password');
          } else if (credentials.username) {
            user = await User.findOne({ username: credentials.username.toLowerCase() }).select('+password');
          }

          if (!user) {
            console.log('User not found');
            throw new Error('User not found');
          }

          if (!user.password) {
            console.log('User has no password');
            throw new Error('Please sign up or use Google login');
          }

          const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

          if (!isPasswordValid) {
            console.log('Invalid password');
            throw new Error('Invalid email or password');
          }

          console.log('Login successful');
          return {
            id: user._id.toString(),
            email: user.email,
            name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email?.split('@')[0],
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
          };
        } catch (error) {
          console.error('Auth error:', error);
          throw error;
        }
      },
    }),
  ],
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      // Allow sign in for all users
      return true;
    },
    async redirect({ url, baseUrl }) {
      // Redirect admins to dashboard after login
      // url is the destination URL (could be relative or absolute)
      // baseUrl is 'http://localhost:3000' or your deployment URL
      
      // If the callback is called without a specific redirect URL,
      // or if it's trying to go to /admin, redirect to /admin/dashboard
      if (url === baseUrl || url.endsWith('/admin')) {
        return `${baseUrl}/admin/dashboard`;
      }
      
      // Otherwise allow the redirect to proceed
      return url.startsWith(baseUrl) ? url : baseUrl;
    },
    async jwt({ token, user, account }: any) {
      console.log('[NEXTAUTH JWT] Called with:', {
        hasUser: !!user,
        userId: user?.id,
        userRole: user?.role,
        hasAccount: !!account,
        tokenId: token?.id,
        tokenRole: token?.role,
      });
      
      if (user) {
        console.log('[NEXTAUTH JWT] User provided, storing in token:', {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role || 'user',
        });
        
        token.id = user.id;
        token.role = user.role || 'user'; // Ensure role defaults to 'user'
        token.email = user.email;
        token.name = user.name;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
      } else {
        console.log('[NEXTAUTH JWT] No user, token remains:', {
          id: token?.id,
          email: token?.email,
          role: token?.role,
        });
      }

      // Handle legacy "demo-admin" ID in existing tokens
      if (token.id === 'demo-admin') {
        try {
          await dbConnect();
          const adminUser = await User.findOne({ email: 'admin@nitminer.com' });
          if (adminUser) {
            token.id = adminUser._id.toString();
            token.role = adminUser.role;
          }
        } catch (error) {
          console.error('Error updating legacy admin token:', error);
        }
      }

      // Handle Google Sign-In
      if (account?.provider === 'google') {
        console.log('[NEXTAUTH JWT] Google provider detected, processing...');
        try {
          await dbConnect();

          // First try to find by googleId
          let dbUser = await User.findOne({ googleId: token.sub });

          // If not found, try to find by email (user might have created account with credentials first)
          if (!dbUser) {
            dbUser = await User.findOne({ email: token.email });

            if (dbUser) {
              console.log('[NEXTAUTH JWT] Found existing user by email, linking Google:', token.email);
              // Link Google account to existing user
              dbUser.googleId = token.sub;
              await dbUser.save();
            } else {
              console.log('[NEXTAUTH JWT] Creating new Google user:', token.email);
              // Parse full name into first and last name
              const nameParts = (token.name || 'Google User').split(' ');
              const firstName = nameParts[0] || 'Google';
              const lastName = nameParts.slice(1).join(' ') || 'User';
              
              // Create new user from Google
              dbUser = await User.create({
                firstName,
                lastName,
                email: token.email,
                phone: '+1-000-000-0000', // Default phone for Google users
                googleId: token.sub,
                role: 'user', // Explicitly set role for Google users
                trialCount: 5,
                isPremium: false,
                subscription: 'free',
                isActive: true,
              });
            }
          } else {
            console.log('[NEXTAUTH JWT] Found user by googleId:', token.email);
          }

          token.id = dbUser._id.toString();
          token.role = dbUser.role || 'user'; // Ensure role is set from database
          token.email = dbUser.email; // Store email from database user
          console.log('[NEXTAUTH JWT] Google user processed:', {
            email: dbUser.email,
            role: dbUser.role,
            id: dbUser._id.toString(),
          });
        } catch (error) {
          console.error('Google auth error:', error);
          // Don't fail the auth, just use default values
          token.role = token.role || 'user'; // Fallback to user role
        }
      }

      return token;
    },
    async session({ session, token }: any) {
      console.log('[NEXTAUTH SESSION] Called with token:', {
        hasToken: !!token,
        tokenKeys: token ? Object.keys(token) : [],
        id: token?.id,
        email: token?.email,
        role: token?.role,
      });
      
      // ALWAYS ensure session.user exists
      if (!session) {
        session = { user: {} };
      }
      if (!session.user) {
        session.user = {};
      }

      // ALWAYS populate from token if token exists
      if (token) {
        console.log('[NEXTAUTH SESSION] Populating session.user from token:', {
          id: token.id,
          email: token.email,
          name: token.name,
          role: token.role || 'user',
        });
        
        session.user.id = token.id;
        session.user.email = token.email;
        session.user.name = token.name;
        session.user.role = token.role || 'user'; // Ensure role defaults to 'user'
        session.user.firstName = token.firstName;
        session.user.lastName = token.lastName;
      } else {
        console.error('[NEXTAUTH SESSION] No token provided!');
      }

      console.log('[NEXTAUTH SESSION] Returning session:', {
        hasUser: !!session.user,
        userId: session.user?.id,
        email: session.user?.email,
        name: session.user?.name,
        role: session.user?.role,
      });
      
      return session;
    },
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  cookies: {
    sessionToken: {
      name: 'next-auth.session-token',
      options: {
        httpOnly: true,
        // Only enforce secure in production with HTTPS
        secure: process.env.NODE_ENV === 'production' && process.env.NEXTAUTH_URL?.startsWith('https'),
        sameSite: 'lax',
        path: '/',
        // Only set domain for production URLs, otherwise let browser handle it
        domain: process.env.NODE_ENV === 'production' && process.env.NEXTAUTH_COOKIE_DOMAIN ? process.env.NEXTAUTH_COOKIE_DOMAIN : undefined,
        maxAge: 30 * 24 * 60 * 60, // 30 days
      },
    },
  },
  debug: false,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
