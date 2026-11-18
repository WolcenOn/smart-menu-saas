import { test, expect } from '@playwright/test';

const email = 'e2e-owner@example.invalid';
const password = 'E2e-Only-Strong-Password-2026!';

test('owner can log in, create a product and mark it sold out', async ({ page }, testInfo) => {
  await page.goto('/acceso');
  await page.getByLabel('Correo electrónico').fill(email);
  await page.getByLabel('Contraseña').fill(password);
  await page.getByRole('button', { name: 'Entrar al panel' }).click();
  await expect(page).toHaveURL(/\/panel(?:\?|$)/);
  await expect(page.getByRole('heading', { name: 'Tu espacio de trabajo' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Restaurante de demostración' })).toBeVisible();
  await expect(page.getByLabel('Resumen de Restaurante de demostración')).toBeVisible();
  await expect(page.getByText('Personalizar apariencia')).toBeVisible();
  await page.getByRole('link', { name: /Editar carta/ }).click();
  await expect(page.getByRole('heading', { name: 'Entrantes' })).toBeVisible();
  await expect(page.getByLabel('Resumen de tu carta')).toContainText('Platos totales');
  await expect(page.getByLabel('Resumen de tu carta')).toContainText('Agotados');

  const dishName = 'Tortilla de pruebas ' + testInfo.project.name;
  await page.getByText('+ Añadir plato o bebida').click();
  const form = page.locator('form').filter({ has: page.getByPlaceholder('Ej. Croquetas caseras') });
  await form.getByPlaceholder('Ej. Croquetas caseras').fill(dishName);
  await form.getByPlaceholder('9,50').fill('6,50');
  await form.getByPlaceholder('Ingredientes, elaboración o presentación').fill('Tortilla de patata elaborada al momento.');
  await form.getByRole('checkbox', { name: 'Huevos' }).check();
  await form.getByRole('checkbox', { name: /Confirmo que he revisado/ }).check();
  await form.getByRole('button', { name: 'Añadir producto' }).click();

  const dish = page.getByRole('article', { name: 'Gestión de ' + dishName });
  await expect(dish).toBeVisible();
  await dish.getByRole('button', { name: 'Marcar agotado' }).click();
  await expect(dish.getByText('Agotado', { exact: true })).toBeVisible();
  await page.goto('/r/demo-restaurante');
  const publicDish = page.getByRole('article', { name: dishName });
  await expect(publicDish).toBeVisible();
  await expect(publicDish.getByText('Agotado', { exact: true })).toBeVisible();
  await expect(publicDish.getByText('Huevos')).toBeVisible();
});

test('public users cannot access restaurant editor', async ({ page }) => {
  await page.goto('/panel/restaurantes/cjld2cjxh0000qzrmn831i7rn');
  await expect(page).toHaveURL(/\/acceso(?:\?|$)/);
});

test('invalid credentials never authenticate', async ({ page }) => {
  await page.goto('/acceso');
  await page.getByLabel('Correo electrónico').fill(email);
  await page.getByLabel('Contraseña').fill('incorrect-password');
  await page.getByRole('button', { name: 'Entrar al panel' }).click();
  await expect(page.getByRole('alert')).toBeVisible();
  await page.goto('/panel');
  await expect(page).toHaveURL(/\/acceso(?:\?|$)/);
});
