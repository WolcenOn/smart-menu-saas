import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import Credentials from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '@/lib/db';

// Credentials are temporary for the pilot. Auth.js sessions and tenant membership
// remain the same when Google OAuth is enabled later.
const googleEnabled = Boolean(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET);
const credentialsSchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email().max(254)),
  password: z.string().min(1).max(200),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'jwt', maxAge: 60 * 60 * 24, updateAge: 60 * 60 },
  providers: [
    Credentials({
      name: 'Correo y contraseña',
      credentials: {
        email: { label: 'Correo electrónico', type: 'email' },
        password: { label: 'Contraseña', type: 'password' },
      },
      async authorize(raw) {
        const input = credentialsSchema.safeParse(raw);
        if (!input.success) return null;

        const user = await prisma.user.findUnique({
          where: { email: input.data.email },
          select: { id: true, email: true, name: true, passwordHash: true, failedLogins: true, lockedUntil: true },
        });

        // Generic rejection; do not disclose whether an email exists.
        if (!user?.passwordHash || (user.lockedUntil && user.lockedUntil > new Date())) return null;
        const valid = await bcrypt.compare(input.data.password, user.passwordHash);
        if (!valid) {
          const result = await prisma.user.update({
            where: { id: user.id },
            data: { failedLogins: { increment: 1 } },
            select: { failedLogins: true },
          });
          if (result.failedLogins >= 5) {
            await prisma.user.update({
              where: { id: user.id },
              data: { lockedUntil: new Date(Date.now() + 15 * 60_000), failedLogins: 0 },
            });
          }
          return null;
        }

        await prisma.user.update({
          where: { id: user.id },
          data: { failedLogins: 0, lockedUntil: null },
        });
        return { id: user.id, name: user.name, email: user.email };
      },
    }),
    ...(googleEnabled ? [Google] : []),
  ],
  pages: { signIn: '/acceso' },
  trustHost: process.env.AUTH_TRUST_HOST === 'true',
  callbacks: {
    async jwt({ token, user }) {
      if (user?.id) token.sub = user.id;
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.sub) session.user.id = token.sub;
      return session;
    },
  },
});
