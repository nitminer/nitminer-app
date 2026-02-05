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
    async redirect({ url, baseUrl }) {
      // If the URL is relative, prepend the base URL
      if (url.startsWith('/')) return `${baseUrl}${url}`;

      // If the URL is already absolute, allow it
      if (new URL(url).origin === baseUrl) return url;

      // Default to home page
      return baseUrl;
    },
    async jwt({ token, user, account }: any) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
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
        } catch (error) {
          console.error('Google auth error:', error);
          // Don't fail the auth, just use default values
        }
      }

      return token;
    },
    async session({ session, token }: any) {
      if (session.user) {
        // Handle legacy "demo-admin" ID
        if (token.id === 'demo-admin') {
          try {
            await dbConnect();
            const adminUser = await User.findOne({ email: 'admin@nitminer.com' });
            if (adminUser) {
              session.user.id = adminUser._id.toString();
              session.user.role = adminUser.role;
            } else {
              // If no admin user exists, force logout
              session.user.id = null;
              session.user.role = null;
            }
          } catch (error) {
            console.error('Error handling legacy admin ID:', error);
            session.user.id = null;
            session.user.role = null;
          }
        } else {
          session.user.id = token.id as string;
          session.user.role = token.role as string;
        }
      }
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
  debug: false,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
