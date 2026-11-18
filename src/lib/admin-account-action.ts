import { z } from 'zod';

export const adminAccountAction = z.object({
  userId: z.string().cuid(),
  action: z.enum(['pause', 'resume', 'remove', 'unlock']),
  confirmEmail: z.string().trim().toLowerCase().optional(),
}).strict();

export function canApplyAccountAction(
  action: 'pause' | 'resume' | 'remove' | 'unlock',
  state: { suspendedAt: Date | null; deletedAt: Date | null; email: string; lockedUntil?: Date | null },
  confirmEmail?: string,
) {
  if (state.deletedAt) return false;
  if (action === 'unlock') return state.suspendedAt === null && !!state.lockedUntil && state.lockedUntil > new Date();
  if (action === 'pause') return state.suspendedAt === null;
  if (action === 'resume') return state.suspendedAt !== null;
  return confirmEmail === state.email.toLowerCase();
}
