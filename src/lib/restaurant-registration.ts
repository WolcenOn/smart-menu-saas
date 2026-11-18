import { z } from 'zod';

export const registrationSchema = z.object({
  restaurantName: z.string().trim().min(2).max(160),
  ownerName: z.string().trim().min(2).max(120),
  email: z.string().trim().toLowerCase().pipe(z.email().max(254)),
  password: z.string().min(14).max(100)
    .regex(/[a-z]/, 'Incluye una minúscula')
    .regex(/[A-Z]/, 'Incluye una mayúscula')
    .regex(/[0-9]/, 'Incluye un número')
    .regex(/[^a-zA-Z0-9]/, 'Incluye un símbolo'),
  token: z.string().regex(/^[a-f0-9]{64}$/),
}).strict();

export function makeRestaurantSlug(name: string, suffix: string): string {
  const base = name.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    .slice(0, 55).replace(/-$/g, '');
  return (base || 'restaurante') + '-' + suffix;
}
