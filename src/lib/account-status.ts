// Pure, reusable status interpretation for both the owner and admin experiences.
export type AccountStatus = 'ACTIVE' | 'PAUSED' | 'REMOVED';

export function accountStatus(user: { suspendedAt: Date | null; deletedAt: Date | null }): AccountStatus {
  if (user.deletedAt) return 'REMOVED';
  if (user.suspendedAt) return 'PAUSED';
  return 'ACTIVE';
}

export function accountCanAuthenticate(user: { suspendedAt: Date | null; deletedAt: Date | null }): boolean {
  return accountStatus(user) === 'ACTIVE';
}
