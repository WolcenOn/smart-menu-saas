import { createHash, timingSafeEqual } from 'node:crypto';
import { z } from 'zod';

export const registrationSchema = z.object({
  restaurantName: z.string().trim().min(2).max(160),
  ownerName: z.string().trim().min(2).max(120),
  email: z.email().max(254).transform(value => value.trim().toLowerCase()),
  password: z.string().min(14).max(100)
    .regex(/[a-z]/, 'Incluye una minúscula')
    .regex(/[A-Z]/, 'Incluye una mayúscula')
    .regex(/[0-9]/, 'Incluye un número')
    .regex(/[^a-zA-Z0-9]/, 'Incluye un símbolo'),
  inviteCode: z.string().min(24).max(200),
}).strict();

export function registrationEnabled(): boolean {
  // A single private code gates the pilot until email verification, quotas and
  // a rate limit/WAF are available. No unverified public signups by default.
  return Boolean(process.env.RESTAURANT_SIGNUP_CODE && process.env.RESTAURANT_SIGNUP_CODE.length >= 32);
}

export function validRegistrationCode(code: string): boolean {
  if (!registrationEnabled()) return false;
  const configured = process.env.RESTAURANT_SIGNUP_CODE!;
  // Constant-length digests prevent leaking the configured code's length.
  const submittedDigest = createHash('sha256').update(code).digest();
  const expectedDigest = createHash('sha256').update(configured).digest();
  return timingSafeEqual(submittedDigest, expectedDigest);
}

export function makeRestaurantSlug(name: string, suffix: string): string {
  const base = name.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    .slice(0, 55).replace(/-$/g, '');
  return (base || 'restaurante') + '-' + suffix;
}
