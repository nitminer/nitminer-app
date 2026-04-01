import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';

const hasGoogleProvider =
  Boolean(process.env.GOOGLE_CLIENT_ID) &&
  Boolean(process.env.GOOGLE_CLIENT_SECRET);

const normalizeRole = (role) =>
  String(role || 'user')
    .trim()
    .toLowerCase();

export const authOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        await dbConnect();

        const password = credentials?.password;
        const email = credentials?.email?.trim()?.toLowerCase();
        const username = credentials?.username?.trim()?.toLowerCase();

        if (!password || (!email && !username)) {
          return null;
        }

        const query = email ? { email } : { username };
        const user = await User.findOne(query).lean();

        if (!user || !user.password || user.isActive === false) {
          return null;
        }

        let passwordMatches = false;
        try {
          passwordMatches = await bcrypt.compare(password, user.password);
        } catch {
          passwordMatches = password === user.password;
        }

        if (!passwordMatches) {
          return null;
        }

        return {
          id: String(user._id),
          email: user.email,
          name: user.name || user.firstName || user.username || user.email,
          role: normalizeRole(user.role),
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          isPremium: Boolean(user.isPremium),
          trialCount: Number(user.trialCount || 0),
          subscriptionExpiry: user.subscriptionExpiry || null,
        };
      },
    }),
    ...(hasGoogleProvider
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider !== 'google') {
        return true;
      }

      await dbConnect();
      const googleEmail = user?.email?.toLowerCase();
      if (!googleEmail) {
        return false;
      }

      const existing = await User.findOne({ email: googleEmail });
      if (existing) {
        user.id = String(existing._id);
        user.role = normalizeRole(existing.role);
        user.firstName = existing.firstName || '';
        user.lastName = existing.lastName || '';
        user.isPremium = Boolean(existing.isPremium);
        user.trialCount = Number(existing.trialCount || 0);
        user.subscriptionExpiry = existing.subscriptionExpiry || null;
        return true;
      }

      const created = await User.create({
        email: googleEmail,
        name: user.name || profile?.name || googleEmail.split('@')[0],
        firstName:
          profile?.given_name ||
          user?.name?.split(' ')?.[0] ||
          googleEmail.split('@')[0],
        lastName: profile?.family_name || '',
        verified: true,
        role: 'user',
        trialCount: 3000,
        isPremium: false,
        isActive: true,
      });

      user.id = String(created._id);
      user.role = normalizeRole(created.role);
      user.firstName = created.firstName || '';
      user.lastName = created.lastName || '';
      user.isPremium = Boolean(created.isPremium);
      user.trialCount = Number(created.trialCount || 0);
      user.subscriptionExpiry = created.subscriptionExpiry || null;

      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = normalizeRole(user.role);
        token.firstName = user.firstName || '';
        token.lastName = user.lastName || '';
        token.isPremium = Boolean(user.isPremium);
        token.trialCount = Number(user.trialCount || 0);
        token.subscriptionExpiry = user.subscriptionExpiry || null;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = normalizeRole(token.role);
        session.user.firstName = token.firstName;
        session.user.lastName = token.lastName;
        session.user.isPremium = token.isPremium;
        session.user.trialCount = token.trialCount;
        session.user.subscriptionExpiry = token.subscriptionExpiry;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith('/')) {
        return `${baseUrl}${url}`;
      }
      if (url.startsWith(baseUrl)) {
        return url;
      }
      return `${baseUrl}/dashboard`;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
