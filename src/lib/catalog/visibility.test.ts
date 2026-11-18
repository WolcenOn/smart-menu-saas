import { describe, expect, it } from 'vitest';
import { canSelectDish, isDishPublic } from './visibility';

const base = {
  status: 'PUBLISHED' as const,
  availability: 'AVAILABLE' as const,
  allergensReviewedAt: new Date('2026-01-01T00:00:00Z'),
};

describe('public catalog visibility', () => {
  it('keeps sold out dishes visible but not selectable', () => {
    const dish = { ...base, availability: 'SOLD_OUT' as const };
    expect(isDishPublic(dish)).toBe(true);
    expect(canSelectDish(dish)).toBe(false);
  });

  it('does not publish dishes with unreviewed allergen information', () => {
    const dish = { ...base, allergensReviewedAt: null };
    expect(isDishPublic(dish)).toBe(false);
    expect(canSelectDish(dish)).toBe(false);
  });

  it('does not publish drafts', () => {
    expect(isDishPublic({ ...base, status: 'DRAFT' })).toBe(false);
  });

  it('allows published and available dishes', () => {
    expect(canSelectDish(base)).toBe(true);
  });
});
