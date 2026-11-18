import { test, expect } from '@playwright/test';
import { PrismaClient } from '@prisma/client';

const inviteCode = 'ci-only-restaurant-invite-code-2026-123456';
const password = 'RegistrationTestPassword2026!';

test('restaurant owner registers from separate entry and manages only their restaurant', async ({ page }) => {
  const email = 'pilot-' + crypto.randomUUID() + '@example.invalid';
  const name = 'Casa Test ' + crypto.randomUUID().slice(0, 8);

  await page.goto('/registro-restaurante');
  await expect(page.getByRole('heading', { name: 'Tu restaurante, listo para empezar.' })).toBeVisible();
  await page.getByLabel('Nombre del restaurante').fill(name);
  await page.getByLabel('Tu nombre').fill('Dueña Demo');
  await page.getByLabel('Correo electrónico').fill(email);
  await page.getByLabel('Contraseña').fill(password);
  await page.getByLabel('Código de invitación al piloto').fill(inviteCode);
  await page.getByRole('button', { name: 'Crear mi restaurante' }).click();
  await expect(page).toHaveURL(/\/panel/);
  await expect(page.getByRole('heading', { name })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Restaurante de demostración' })).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'Editar carta' })).toHaveCount(1);

  const db = new PrismaClient();
  try {
    const user = await db.user.findUnique({ where: { email }, include: { memberships: { include: { restaurant: { include: { menus: { include: { categories: true } } } } } } } });
    expect(user?.memberships).toHaveLength(1);
    expect(user?.memberships[0].role).toBe('OWNER');
    expect(user?.memberships[0].restaurant.menus[0].categories).toHaveLength(1);
  } finally { await db.$disconnect(); }
});

test('restaurant registration rejects incorrect invitation without creating account', async ({ page }) => {
  await page.goto('/registro-restaurante');
  await page.getByLabel('Nombre del restaurante').fill('No autorizado');
  await page.getByLabel('Tu nombre').fill('Persona de pruebas');
  await page.getByLabel('Correo electrónico').fill('rejected-' + crypto.randomUUID() + '@example.invalid');
  await page.getByLabel('Contraseña').fill(password);
  await page.getByLabel('Código de invitación al piloto').fill('00000000000000000000000000000000');
  await page.getByRole('button', { name: 'Crear mi restaurante' }).click();
  await expect(page.getByRole('alert')).toBeVisible();
  await expect(page).toHaveURL(/\/registro-restaurante\?error=invalid/);
});
