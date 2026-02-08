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
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        try {
          console.log('Authorize called with:', { email: credentials?.email, hasPassword: !!credentials?.password });
          if (!credentials?.email || !credentials?.password) {
            console.log('Missing credentials');
            throw new Error('Email and password are required');
          }

          // Demo admin credentials - check/create admin user
          if (credentials.email === 'admin@nitminer.com' && credentials.password === '12345678') {
            console.log('Admin login attempt');
            await dbConnect();

            let adminUser = await User.findOne({ email: 'admin@nitminer.com' });

            if (!adminUser) {
              console.log('Creating admin user');
              // Create demo admin user if it doesn't exist
              adminUser = new User({
                firstName: 'Demo',
                lastName: 'Admin',
                email: 'admin@nitminer.com',
                phone: '+1-000-000-0000',
                password: await bcrypt.hash('12345678', 12),
                role: 'admin',
                subscription: 'free',
                isActive: true,
              });
              await adminUser.save();
              console.log('Admin user created');
            } else {
              console.log('Admin user found');
            }

            return {
              id: adminUser._id.toString(),
              email: adminUser.email,
              name: `${adminUser.firstName || ''} ${adminUser.lastName || ''}`.trim() || 'Admin',
              firstName: adminUser.firstName,
              lastName: adminUser.lastName,
              role: adminUser.role,
            };
          }

          console.log('Regular user login');
          await dbConnect();

          const user = await User.findOne({ email: credentials.email }).select('+password');

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
    async jwt({ token, user, account }: any) {
      console.log('[NEXTAUTH JWT] Called with:', {
        hasUser: !!user,
        userId: user?.id,
        hasAccount: !!account,
        tokenId: token?.id,
      });
      
      if (user) {
        console.log('[NEXTAUTH JWT] User provided, storing in token:', {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        });
        
        token.id = user.id;
        token.role = user.role;
        token.email = user.email;
        token.name = user.name;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
      } else {
        console.log('[NEXTAUTH JWT] No user, token remains:', {
          id: token?.id,
          email: token?.email,
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
        try {
          await dbConnect();

          // First try to find by googleId
          let dbUser = await User.findOne({ googleId: token.sub });

          // If not found, try to find by email (user might have created account with credentials first)
          if (!dbUser) {
            dbUser = await User.findOne({ email: token.email });

            if (dbUser) {
              // Link Google account to existing user
              dbUser.googleId = token.sub;
              await dbUser.save();
            } else {
              // Create new user from Google
              dbUser = await User.create({
                name: token.name,
                email: token.email,
                googleId: token.sub,
                role: 'user',
                trialCount: 5,
              });
            }
          }

          token.id = dbUser._id.toString();
          token.role = dbUser.role;
          token.email = dbUser.email; // Store email from database user
        } catch (error) {
          console.error('Google auth error:', error);
          // Don't fail the auth, just use default values
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
        });
        
        session.user.id = token.id;
        session.user.email = token.email;
        session.user.name = token.name;
        session.user.role = token.role || 'user';
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
        secure: process.env.NODE_ENV === 'production' && process.env.NEXTAUTH_COOKIE_SECURE === 'true',
        sameSite: 'lax',
        path: '/',
        domain: process.env.NEXTAUTH_COOKIE_DOMAIN || undefined,
        maxAge: 30 * 24 * 60 * 60, // 30 days
      },
    },
  },
  debug: false,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
