import { describe, it, expect } from 'vitest';
import { themeInputSchema } from './theme-input';

const valid = { restaurantId: 'cjld2cjxh0000qzrmn831i7rn', preset: 'OLIVE', layout: 'CARDS', tagline: 'Cocina de autor' };

describe('restaurant theme input', () => {
  it('accepts defined presets and bounded text', () => {
    expect(themeInputSchema.safeParse(valid).success).toBe(true);
  });
  it('rejects unapproved CSS classes or style injection', () => {
    expect(themeInputSchema.safeParse({ ...valid, preset: 'OLIVE;position:fixed' }).success).toBe(false);
    expect(themeInputSchema.safeParse({ ...valid, layout: '<script>' }).success).toBe(false);
  });
  it('rejects overly long descriptions and additional keys', () => {
    expect(themeInputSchema.safeParse({ ...valid, tagline: 'x'.repeat(181) }).success).toBe(false);
    expect(themeInputSchema.safeParse({ ...valid, role: 'OWNER' }).success).toBe(false);
  });
});
