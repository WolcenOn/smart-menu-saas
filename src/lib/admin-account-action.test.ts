import { describe, expect, it } from 'vitest';
import { adminAccountAction, canApplyAccountAction } from './admin-account-action';

const active = { email: 'owner@example.com', suspendedAt: null, deletedAt: null };
const paused = { ...active, suspendedAt: new Date() };

describe('administrative account actions', () => {
  it('requires exact email confirmation before disabling access permanently', () => {
    expect(canApplyAccountAction('remove', active, 'owner@example.com')).toBe(true);
    expect(canApplyAccountAction('remove', active, 'wrong@example.com')).toBe(false);
    expect(canApplyAccountAction('remove', active)).toBe(false);
  });
  it('only permits meaningful state transitions', () => {
    expect(canApplyAccountAction('pause', active)).toBe(true);
    expect(canApplyAccountAction('resume', active)).toBe(false);
    expect(canApplyAccountAction('resume', paused)).toBe(true);
    expect(canApplyAccountAction('pause', paused)).toBe(false);
    expect(canApplyAccountAction('resume', { ...active, deletedAt: new Date() })).toBe(false);
    expect(canApplyAccountAction('unlock', { ...active, lockedUntil: new Date(Date.now() + 60000) })).toBe(true);
    expect(canApplyAccountAction('unlock', active)).toBe(false);
    expect(canApplyAccountAction('unlock', { ...paused, lockedUntil: new Date(Date.now() + 60000) })).toBe(false);
  });
  it('rejects unknown actions and injected parameters', () => {
    const valid = { userId: 'cjld2cjxh0000qzrmn831i7rn', action: 'pause' };
    expect(adminAccountAction.safeParse(valid).success).toBe(true);
    expect(adminAccountAction.safeParse({ ...valid, action: 'make-superadmin' }).success).toBe(false);
    expect(adminAccountAction.safeParse({ ...valid, arbitrary: true }).success).toBe(false);
  });
});
