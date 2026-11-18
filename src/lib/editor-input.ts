import { z } from 'zod';

export const ALLERGEN_IDS = [
  'gluten', 'crustaceos', 'huevos', 'pescado', 'cacahuetes',
  'soja', 'leche', 'frutos-cascara', 'apio', 'mostaza',
  'sesamo', 'sulfitos', 'altramuces', 'moluscos',
] as const;

const cuid = z.string().cuid();
const money = z.string().trim().regex(/^\d{1,5}([,.]\d{1,2})?$/, 'Precio incorrecto')
  .transform(value => Number(value.replace(',', '.')).toFixed(2))
  .refine(value => Number(value) > 0, 'El precio debe ser positivo');
const allergens = z.array(z.enum(ALLERGEN_IDS)).max(14)
  .refine(values => new Set(values).size === values.length, 'Alérgenos duplicados');

export const categoryInput = z.object({
  restaurantId: cuid,
  menuId: cuid,
  name: z.string().trim().min(2).max(100),
}).strict();

const dishCommon = z.object({
  restaurantId: cuid,
  name: z.string().trim().min(2).max(160),
  description: z.string().trim().max(1200),
  price: money,
  allergens,
  reviewed: z.boolean(),
}).strict();

export const createDishInput = dishCommon.extend({ categoryId: cuid });
export const updateDishInput = dishCommon.extend({ dishId: cuid });
export const availabilityInput = z.object({
  restaurantId: cuid,
  dishId: cuid,
  availability: z.enum(['AVAILABLE', 'SOLD_OUT']),
}).strict();

export function readAllergens(form: FormData): string[] {
  return form.getAll('allergens').filter((value): value is string => typeof value === 'string');
}

export function readText(form: FormData, name: string) {
  return form.get(name);
}
