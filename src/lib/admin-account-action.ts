import { z } from 'zod';

export const adminAccountAction = z.object({
  userId: z.string().cuid(),
  action: z.enum(['pause', 'resume', 'remove']),
  confirmEmail: z.string().trim().toLowerCase().optional(),
}).strict();

export function canApplyAccountAction(
  action: 'pause' | 'resume' | 'remove',
  state: { suspendedAt: Date | null; deletedAt: Date | null; email: string },
  confirmEmail?: string,
) {
  if (state.deletedAt) return false;
  if (action === 'pause') return state.suspendedAt === null;
  if (action === 'resume') return state.suspendedAt !== null;
  return confirmEmail === state.email.toLowerCase();
}
