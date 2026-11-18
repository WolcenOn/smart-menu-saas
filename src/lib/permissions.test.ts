import { describe, expect, it } from 'vitest';
import { canPerform } from './permissions';

describe('tenant role permission matrix', () => {
  it('denies all access for unauthenticated and non-member users', () => {
    expect(canPerform(null, 'viewDashboard')).toBe(false);
    expect(canPerform(undefined, 'manageTheme')).toBe(false);
  });
  it('restricts waiter to dashboard and availability', () => {
    expect(canPerform('WAITER', 'toggleAvailability')).toBe(true);
    expect(canPerform('WAITER', 'manageTheme')).toBe(false);
    expect(canPerform('WAITER', 'manageMembers')).toBe(false);
  });
  it('allows editor to manage menu but never members', () => {
    expect(canPerform('EDITOR', 'manageMenu')).toBe(true);
    expect(canPerform('EDITOR', 'manageMembers')).toBe(false);
  });
  it('allows owner to manage memberships', () => {
    expect(canPerform('OWNER', 'manageMembers')).toBe(true);
  });
});
