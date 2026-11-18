import { describe, expect, it } from 'vitest';
import { accountCanAuthenticate, accountStatus } from './account-status';

describe('account access states', () => {
  it('permits active users', () => {
    expect(accountCanAuthenticate({ suspendedAt: null, deletedAt: null })).toBe(true);
  });
  it('blocks paused users and deleted-access users', () => {
    expect(accountCanAuthenticate({ suspendedAt: new Date(), deletedAt: null })).toBe(false);
    expect(accountCanAuthenticate({ suspendedAt: null, deletedAt: new Date() })).toBe(false);
    expect(accountStatus({ suspendedAt: new Date(), deletedAt: new Date() })).toBe('REMOVED');
  });
});
