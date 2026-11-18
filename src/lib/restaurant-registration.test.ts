import { describe, expect, it, afterEach } from 'vitest';
import { makeRestaurantSlug, registrationEnabled, registrationSchema, validRegistrationCode } from './restaurant-registration';

const good = {
  restaurantName: 'La Cañada',
  ownerName: 'María García',
  email: ' DUENO@example.com ',
  password: 'ClaveSegura2026!Mas',
  inviteCode: '01234567890123456789012345678901',
};
const initial = process.env.RESTAURANT_SIGNUP_CODE;
afterEach(() => { if (initial === undefined) delete process.env.RESTAURANT_SIGNUP_CODE; else process.env.RESTAURANT_SIGNUP_CODE = initial; });

describe('restaurant onboarding', () => {
  it('normalizes identity and generates an unguessable-suffix-compatible URL', () => {
    const p = registrationSchema.parse(good);
    expect(p.email).toBe('dueno@example.com');
    expect(makeRestaurantSlug('La Cañada', 'ab12cd34')).toBe('la-canada-ab12cd34');
  });
  it('rejects weak credentials, injected fields and invalid email', () => {
    expect(registrationSchema.safeParse({ ...good, password: '1234' }).success).toBe(false);
    expect(registrationSchema.safeParse({ ...good, role: 'OWNER' }).success).toBe(false);
    expect(registrationSchema.safeParse({ ...good, email: 'bad-email' }).success).toBe(false);
  });
  it('does not enable signup without a strong private code', () => {
    delete process.env.RESTAURANT_SIGNUP_CODE;
    expect(registrationEnabled()).toBe(false);
    expect(validRegistrationCode(good.inviteCode)).toBe(false);
    process.env.RESTAURANT_SIGNUP_CODE = good.inviteCode;
    expect(validRegistrationCode(good.inviteCode)).toBe(true);
    expect(validRegistrationCode('00000000000000000000000000000000')).toBe(false);
  });
});
