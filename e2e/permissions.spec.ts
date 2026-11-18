import { test, expect } from '@playwright/test';
import { PrismaClient } from '@prisma/client';

const password = 'E2e-Only-Strong-Password-2026!';

async function login(page: import('@playwright/test').Page, email: string) {
  await page.goto('/acceso');
  await page.getByLabel('Correo electrónico').fill(email);
  await page.getByLabel('Contraseña').fill(password);
  await page.getByRole('button', { name: 'Entrar al panel' }).click();
  await expect(page).toHaveURL(/\/panel(?:\?|$)/);
}

test('waiter can mark availability but cannot modify products or themes', async ({ page }) => {
  await login(page, 'e2e-waiter@example.invalid');
  await expect(page.getByText('Tu cuenta permite gestionar disponibilidad')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Guardar apariencia' })).toHaveCount(0);
  await page.getByRole('link', { name: 'Editar carta' }).click();
  await expect(page.getByRole('button', { name: 'Marcar agotado' }).first()).toBeVisible();
  await expect(page.getByText('+ Añadir plato o bebida')).toHaveCount(0);
  await expect(page.getByText('Editar plato y alérgenos')).toHaveCount(0);
});

test('owner cannot view the editor of another restaurant', async ({ page }, testInfo) => {
  const prisma = new PrismaClient();
  const other = await prisma.restaurant.create({
    data: { slug: 'private-tenant-' + testInfo.project.name + '-' + Date.now(), name: 'Otro establecimiento' },
    select: { id: true },
  });
  await prisma.$disconnect();

  await login(page, 'e2e-owner@example.invalid');
  const response = await page.goto('/panel/restaurantes/' + other.id);
  expect(response?.status()).toBe(404);
});
