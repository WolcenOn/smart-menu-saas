'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db';
import { requireRestaurantPermission } from '@/lib/tenant-authorization';
import {
  availabilityInput, categoryInput, createDishInput, updateDishInput,
  readAllergens, readText,
} from '@/lib/editor-input';

function parseOrThrow<T>(result: { success: true; data: T } | { success: false }): T {
  if (!result.success) throw new Error('INVALID_INPUT');
  return result.data;
}

function invalidate(restaurantId: string, slug: string) {
  revalidatePath('/panel/restaurantes/' + restaurantId);
  revalidatePath('/r/' + slug);
  revalidatePath('/panel');
}

export async function addCategory(form: FormData) {
  const input = parseOrThrow(categoryInput.safeParse({
    restaurantId: readText(form, 'restaurantId'),
    menuId: readText(form, 'menuId'),
    name: readText(form, 'name'),
  }));
  await requireRestaurantPermission(input.restaurantId, 'manageMenu');
  const menu = await prisma.menu.findFirst({
    where: { id: input.menuId, restaurantId: input.restaurantId },
    select: { id: true, restaurant: { select: { slug: true } } },
  });
  if (!menu) throw new Error('NOT_FOUND');
  const last = await prisma.menuCategory.aggregate({
    where: { menuId: menu.id }, _max: { position: true },
  });
  await prisma.menuCategory.create({
    data: { menuId: menu.id, name: input.name, position: (last._max.position ?? 0) + 1 },
  });
  invalidate(input.restaurantId, menu.restaurant.slug);
}

export async function addDish(form: FormData) {
  const input = parseOrThrow(createDishInput.safeParse({
    restaurantId: readText(form, 'restaurantId'),
    categoryId: readText(form, 'categoryId'),
    name: readText(form, 'name'),
    description: readText(form, 'description'),
    price: readText(form, 'price'),
    allergens: readAllergens(form),
    reviewed: readText(form, 'reviewed') === 'on',
  }));
  await requireRestaurantPermission(input.restaurantId, 'manageMenu');
  const category = await prisma.menuCategory.findFirst({
    where: { id: input.categoryId, menu: { restaurantId: input.restaurantId } },
    select: { id: true, menu: { select: { restaurant: { select: { slug: true } } } } },
  });
  if (!category) throw new Error('NOT_FOUND');
  const last = await prisma.dish.aggregate({
    where: { categoryId: category.id }, _max: { position: true },
  });
  await prisma.dish.create({
    data: {
      categoryId: input.categoryId, name: input.name, description: input.description,
      price: input.price, status: input.reviewed ? 'PUBLISHED' : 'DRAFT',
      allergensReviewedAt: input.reviewed ? new Date() : null,
      position: (last._max.position ?? 0) + 1,
      allergens: { create: input.allergens.map(allergenId => ({ allergenId })) },
    },
  });
  invalidate(input.restaurantId, category.menu.restaurant.slug);
}

export async function editDish(form: FormData) {
  const input = parseOrThrow(updateDishInput.safeParse({
    restaurantId: readText(form, 'restaurantId'),
    dishId: readText(form, 'dishId'),
    name: readText(form, 'name'),
    description: readText(form, 'description'),
    price: readText(form, 'price'),
    allergens: readAllergens(form),
    reviewed: readText(form, 'reviewed') === 'on',
  }));
  await requireRestaurantPermission(input.restaurantId, 'manageMenu');
  const result = await prisma.$transaction(async tx => {
    const updated = await tx.dish.updateMany({
      where: { id: input.dishId, category: { menu: { restaurantId: input.restaurantId } } },
      data: {
        name: input.name, description: input.description, price: input.price,
        status: input.reviewed ? 'PUBLISHED' : 'DRAFT',
        allergensReviewedAt: input.reviewed ? new Date() : null,
      },
    });
    if (updated.count !== 1) throw new Error('NOT_FOUND');
    await tx.dishAllergen.deleteMany({ where: { dishId: input.dishId } });
    if (input.allergens.length > 0) {
      await tx.dishAllergen.createMany({
        data: input.allergens.map(allergenId => ({ dishId: input.dishId, allergenId })),
      });
    }
    return tx.restaurant.findUnique({
      where: { id: input.restaurantId }, select: { slug: true },
    });
  });
  if (result) invalidate(input.restaurantId, result.slug);
}

export async function changeDishAvailability(form: FormData) {
  const input = parseOrThrow(availabilityInput.safeParse({
    restaurantId: readText(form, 'restaurantId'),
    dishId: readText(form, 'dishId'),
    availability: readText(form, 'availability'),
  }));
  await requireRestaurantPermission(input.restaurantId, 'toggleAvailability');
  const changed = await prisma.dish.updateMany({
    where: { id: input.dishId, category: { menu: { restaurantId: input.restaurantId } } },
    data: { availability: input.availability },
  });
  if (changed.count !== 1) throw new Error('NOT_FOUND');
  const restaurant = await prisma.restaurant.findUnique({
    where: { id: input.restaurantId }, select: { slug: true },
  });
  if (restaurant) invalidate(input.restaurantId, restaurant.slug);
}
