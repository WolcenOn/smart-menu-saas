import { describe, expect, it } from 'vitest';
import { canResetPassword, newTemporaryPassword, resetPasswordInput } from './admin-password-reset';

describe('administrator password recovery', () => {
  it('generates strong unique passwords without unsafe characters', () => {
    const first = newTemporaryPassword();
    const second = newTemporaryPassword();
    expect(first).not.toEqual(second);
    expect(first.length).toBeGreaterThanOrEqual(40);
    expect(first).toMatch(/^[A-Za-z0-9_-]+$/);
  });
  it('requires an exact email confirmation for active accounts', () => {
    const account = { email: 'owner@example.com', deletedAt: null, suspendedAt: null };
    expect(canResetPassword(account, 'owner@example.com')).toBe(true);
    expect(canResetPassword(account, 'other@example.com')).toBe(false);
    expect(canResetPassword({ ...account, deletedAt: new Date() }, account.email)).toBe(false);
    expect(canResetPassword({ ...account, suspendedAt: new Date() }, account.email)).toBe(false);
  });
  it('rejects unexpected client fields', () => {
    const valid = { userId: 'cjld2cjxh0000qzrmn831i7rn', confirmEmail: 'OWNER@example.com' };
    expect(resetPasswordInput.safeParse(valid).success).toBe(true);
    expect(resetPasswordInput.safeParse({ ...valid, role: 'OWNER' }).success).toBe(false);
  });
});
