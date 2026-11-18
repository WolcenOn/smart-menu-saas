import { describe, it, expect } from 'vitest';
import { availabilityInput, categoryInput, createDishInput, ALLERGEN_IDS } from './editor-input';

const restaurantId = 'cjld2cjxh0000qzrmn831i7rn';
const categoryId = 'cjld2cjxh0000qzrmn831i7ro';
const base = {
  restaurantId, categoryId, name: 'Croquetas', description: 'Caseras',
  price: '9,50', allergens: ['gluten', 'leche'], reviewed: true,
};

describe('secure menu editor inputs', () => {
  it('normalizes price without floating point amounts', () => {
    const parsed = createDishInput.parse(base);
    expect(parsed.price).toBe('9.50');
    expect(ALLERGEN_IDS).toHaveLength(14);
  });
  it('rejects unexpected fields and invalid allergens', () => {
    expect(createDishInput.safeParse({ ...base, role: 'OWNER' }).success).toBe(false);
    expect(createDishInput.safeParse({ ...base, allergens: ['unknown'] }).success).toBe(false);
    expect(createDishInput.safeParse({ ...base, allergens: ['gluten', 'gluten'] }).success).toBe(false);
  });
  it('rejects negative or oversized amounts', () => {
    expect(createDishInput.safeParse({ ...base, price: '-4.00' }).success).toBe(false);
    expect(createDishInput.safeParse({ ...base, price: '999999999999' }).success).toBe(false);
  });
  it('rejects unbounded category names', () => {
    expect(categoryInput.safeParse({ restaurantId, menuId: categoryId, name: 'x'.repeat(101) }).success).toBe(false);
  });
  it('only accepts intended availability values', () => {
    expect(availabilityInput.safeParse({ restaurantId, dishId: categoryId, availability: 'SOLD_OUT' }).success).toBe(true);
    expect(availabilityInput.safeParse({ restaurantId, dishId: categoryId, availability: 'HIDDEN' }).success).toBe(false);
  });
});
