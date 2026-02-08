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
                name: 'Demo Admin',
                email: 'admin@nitminer.com',
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
              name: adminUser.name,
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
            name: user.name,
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
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.email = user.email; // CRITICAL: Store email in token so it's available in session
        console.log('JWT callback - user provided:', { id: user.id, role: user.role, email: user.email });
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
      // Ensure user object exists
      if (!session.user) {
        session.user = {};
      }

      // Always preserve email from token (should be there after JWT callback)
      if (token.email) {
        session.user.email = token.email;
      }

      // Always populate id and role from token
      if (token.id === 'demo-admin') {
        try {
          await dbConnect();
          const adminUser = await User.findOne({ email: 'admin@nitminer.com' });
          if (adminUser) {
            session.user.id = adminUser._id.toString();
            session.user.role = adminUser.role;
            session.user.isPremium = adminUser.isPremium;
            session.user.trialCount = adminUser.trialCount;
            session.user.email = adminUser.email; // Ensure email is set
          } else {
            // If no admin user exists, don't include them
            session.user.id = null;
            session.user.role = null;
            session.user.isPremium = false;
            session.user.trialCount = 0;
          }
        } catch (error) {
          console.error('Error handling legacy admin ID:', error);
          session.user.id = token.id;
          session.user.role = 'user';
          session.user.isPremium = false;
          session.user.trialCount = 0;
        }
      } else if (token.id) {
        session.user.id = token.id as string;
        session.user.role = (token.role as string) || 'user';
        
        // Fetch user data to get premium status and trial count
        try {
          await dbConnect();
          const user = await User.findById(token.id);
          if (user) {
            session.user.isPremium = user.isPremium;
            session.user.trialCount = user.trialCount;
            // Also ensure email from database
            if (!session.user.email) {
              session.user.email = user.email;
            }
          } else {
            session.user.isPremium = false;
            session.user.trialCount = 0;
          }
        } catch (error) {
          console.error('Error fetching user data in session callback:', error);
          session.user.isPremium = false;
          session.user.trialCount = 0;
        }
      }

      console.log('Session callback result:', {
        email: session.user?.email,
        id: session.user?.id,
        role: session.user?.role,
        isPremium: session.user?.isPremium,
        trialCount: session.user?.trialCount,
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
