import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/lib/db';

// OAuth providers are intentionally disabled until the operator configures both
// values in Railway. No public user provisioning or default owner is created.
const googleConfigured = Boolean(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET);

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: 'database',
    maxAge: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
  },
  providers: googleConfigured ? [Google] : [],
  pages: { signIn: '/acceso' },
  trustHost: process.env.AUTH_TRUST_HOST === 'true',
});
