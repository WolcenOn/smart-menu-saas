import { z } from 'zod';

export const themeInputSchema = z.object({
  restaurantId: z.string().cuid(),
  preset: z.enum(['OLIVE', 'TERRACOTTA', 'OCEAN', 'NOIR']),
  layout: z.enum(['CARDS', 'LIST']),
  tagline: z.string().trim().max(180),
}).strict();
