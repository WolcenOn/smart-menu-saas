import 'server-only';
import { randomBytes } from 'node:crypto';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { adminEnabled, signAdminSession, validAdminSession } from '@/lib/invitation-tokens';

const COOKIE_NAME = 'sm-admin-session';
const SESSION_SECONDS = 60 * 60;

export async function adminIsAuthenticated() {
  const jar = await cookies();
  return validAdminSession(jar.get(COOKIE_NAME)?.value);
}

export async function requireAdminSession() {
  if (!await adminIsAuthenticated()) redirect('/admin/acceso');
}

export async function startAdminSession() {
  if (!adminEnabled()) throw new Error('ADMIN_DISABLED');
  const jar = await cookies();
  jar.set(COOKIE_NAME, signAdminSession(Date.now() + SESSION_SECONDS * 1000, randomBytes(16).toString('hex')), {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    path: '/admin',
    maxAge: SESSION_SECONDS,
  });
}

export async function endAdminSession() {
  const jar = await cookies();
  jar.delete(COOKIE_NAME);
}
