import { randomBytes } from 'node:crypto';
import { z } from 'zod';

export const resetPasswordInput = z.object({
  userId: z.string().cuid(),
  confirmEmail: z.string().trim().toLowerCase().pipe(z.email().max(254)),
}).strict();

export function newTemporaryPassword(): string {
  // 32 random bytes ~ 256 bits; generated exclusively by the server.
  return randomBytes(32).toString('base64url');
}

export function canResetPassword(user: {
  email: string;
  deletedAt: Date | null;
  suspendedAt: Date | null;
}, requestedEmail: string): boolean {
  return !user.deletedAt && !user.suspendedAt && user.email.toLowerCase() === requestedEmail;
}
