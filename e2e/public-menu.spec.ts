import { test, expect } from '@playwright/test';

test('public menu displays allergen information and visible sold-out dish', async ({ page }) => {
  await page.goto('/r/demo-restaurante');
  await expect(page.getByRole('heading', { name: 'Restaurante de demostración' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Croquetas caseras' })).toBeVisible();
  await expect(page.getByText('Cereales con gluten')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Arroz con bogavante' })).toBeVisible();
  await expect(page.getByText('Agotado', { exact: true })).toBeVisible();
  await expect(page.getByText('Plato no revisado')).toHaveCount(0);
});

test('untrusted dish names are rendered as text, never HTML', async ({ page }) => {
  await page.goto('/r/demo-restaurante');
  await expect(page.getByText('<img src=x onerror=alert(1)>', { exact: true })).toBeVisible();
  await expect(page.locator('article.feature img')).toHaveCount(0);
});

test('invalid restaurant slugs respond with 404', async ({ page }) => {
  const response = await page.goto('/r/%3Cscript%3E');
  expect(response?.status()).toBe(404);
});
