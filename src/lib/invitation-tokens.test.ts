import { afterEach, describe, expect, it } from 'vitest';
import { adminEnabled, hashInvitationToken, invitationEmailSchema, invitationRawTokenSchema, matchesAdminKey, newInvitationToken, signAdminSession, validAdminSession } from './invitation-tokens';

const secret = process.env.AUTH_SECRET;
const key = process.env.ADMIN_ACCESS_KEY;
afterEach(() => {
  if (secret === undefined) delete process.env.AUTH_SECRET; else process.env.AUTH_SECRET = secret;
  if (key === undefined) delete process.env.ADMIN_ACCESS_KEY; else process.env.ADMIN_ACCESS_KEY = key;
});

describe('invitation and administrator security', () => {
  it('generates 256-bit single-use candidate tokens, stores only their digest', () => {
    const a = newInvitationToken();
    const b = newInvitationToken();
    expect(a).not.toBe(b);
    expect(invitationRawTokenSchema.safeParse(a).success).toBe(true);
    expect(hashInvitationToken(a)).toMatch(/^[a-f0-9]{64}$/);
    expect(hashInvitationToken(a)).not.toBe(a);
  });
  it('validates and normalizes invited email', () => {
    expect(invitationEmailSchema.parse(' DUENO@Example.COM ')).toBe('dueno@example.com');
    expect(invitationEmailSchema.safeParse('bad').success).toBe(false);
  });
  it('fails closed when admin secret is absent', () => {
    delete process.env.ADMIN_ACCESS_KEY;
    expect(adminEnabled()).toBe(false);
    expect(matchesAdminKey('anything')).toBe(false);
    expect(validAdminSession(undefined)).toBe(false);
  });
  it('uses short-lived signed cookies and rejects tampering', () => {
    process.env.AUTH_SECRET = 'auth-secret-long-enough-only-for-unit-tests';
    process.env.ADMIN_ACCESS_KEY = 'long-admin-test-key-which-is-definitely-over-forty-eight-characters';
    expect(matchesAdminKey(process.env.ADMIN_ACCESS_KEY)).toBe(true);
    const now = Date.now();
    const value = signAdminSession(now + 30 * 60 * 1000, '0123456789abcdef0123456789abcdef');
    expect(validAdminSession(value, now)).toBe(true);
    expect(validAdminSession(value.slice(0, -1) + (value.endsWith('f') ? 'a' : 'f'), now)).toBe(false);
    expect(validAdminSession(value, now + 40 * 60 * 1000)).toBe(false);
  });
});
