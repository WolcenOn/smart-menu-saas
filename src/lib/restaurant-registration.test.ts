import { describe, it, expect } from 'vitest';
import { registrationSchema, makeRestaurantSlug } from './restaurant-registration';

const valid = {
  restaurantName: 'La Cañada',
  ownerName: 'María García',
  email: ' DUENO@example.com ',
  password: 'ClaveSegura2026!Mas',
  token: '0123456789abcdef'.repeat(4),
};
describe('invitation-only restaurant registration', () => {
  it('normalizes identity and makes a safe URL slug', () => {
    expect(registrationSchema.parse(valid).email).toBe('dueno@example.com');
    expect(makeRestaurantSlug('La Cañada', 'ab12cd34')).toBe('la-canada-ab12cd34');
  });
  it('rejects weak passwords, invalid tokens and extraneous role fields', () => {
    expect(registrationSchema.safeParse({ ...valid, password: '1234' }).success).toBe(false);
    expect(registrationSchema.safeParse({ ...valid, token: 'not-a-token' }).success).toBe(false);
    expect(registrationSchema.safeParse({ ...valid, role: 'OWNER' }).success).toBe(false);
  });
});
