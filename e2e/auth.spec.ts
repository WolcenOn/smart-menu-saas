import { test, expect } from '@playwright/test';

test('professional dashboard redirects unauthenticated users to sign in', async ({ page }) => {
  await page.goto('/panel');
  await expect(page).toHaveURL(/\/acceso(?:\?|$)/);
  await expect(page.getByRole('heading', { name: 'Bienvenido a tu espacio.' })).toBeVisible();
});

test('login presents credentials and separate restaurant onboarding', async ({ page }) => {
  await page.goto('/acceso');
  await expect(page.getByText('ACCESO PROFESIONAL')).toBeVisible();
  await expect(page.locator('input[type=password]')).toHaveCount(1);
  await expect(page.getByRole('link', { name: 'Crear mi restaurante' })).toBeVisible();
});
