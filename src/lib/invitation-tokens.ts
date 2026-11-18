import { createHash, randomBytes, timingSafeEqual, createHmac } from 'node:crypto';
import { z } from 'zod';

export const invitationEmailSchema = z.string().trim().toLowerCase().pipe(z.email().max(254));
export const inviteDurationSchema = z.coerce.number().int().min(1).max(168);
export const invitationRawTokenSchema = z.string().regex(/^[a-f0-9]{64}$/);

export function newInvitationToken() {
  return randomBytes(32).toString('hex');
}

export function hashInvitationToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

function secureEqual(a: string, b: string): boolean {
  const left = createHash('sha256').update(a).digest();
  const right = createHash('sha256').update(b).digest();
  return timingSafeEqual(left, right);
}

export function adminEnabled() {
  return Boolean(process.env.ADMIN_ACCESS_KEY && process.env.ADMIN_ACCESS_KEY.length >= 48
    && process.env.AUTH_SECRET && process.env.AUTH_SECRET.length >= 32);
}

export function matchesAdminKey(value: string): boolean {
  return adminEnabled() && secureEqual(value, process.env.ADMIN_ACCESS_KEY!);
}

export function signAdminSession(expires: number, nonce: string): string {
  const key = process.env.ADMIN_ACCESS_KEY;
  const secret = process.env.AUTH_SECRET;
  if (!key || !secret || !adminEnabled()) throw new Error('ADMIN_DISABLED');
  const message = expires + '.' + nonce;
  const mac = createHmac('sha256', secret).update('admin-session-v1:' + key + ':' + message).digest('hex');
  return message + '.' + mac;
}

export function validAdminSession(value: string | undefined, now = Date.now()): boolean {
  if (!adminEnabled() || !value || value.length > 240) return false;
  const parts = value.split('.');
  if (parts.length !== 3 || !/^\d{13}$/.test(parts[0]) || !/^[0-9a-f]{32}$/.test(parts[1]) || !/^[0-9a-f]{64}$/.test(parts[2])) return false;
  const expires = Number(parts[0]);
  if (expires <= now || expires > now + 60 * 60 * 1000) return false;
  const expected = signAdminSession(expires, parts[1]);
  return secureEqual(expected, value);
}
