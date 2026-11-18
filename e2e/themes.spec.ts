import { test, expect } from '@playwright/test';

test('restaurant theme preview changes style and layout', async ({ page }) => {
  await page.goto('/demo/temas');
  const menu = page.getByTestId('restaurant-menu');
  await expect(menu).toHaveAttribute('data-theme', 'OLIVE');
  await page.getByRole('button', { name: 'Terracota' }).click();
  await expect(menu).toHaveAttribute('data-theme', 'TERRACOTTA');
  await page.getByLabel('Presentación').selectOption('LIST');
  await expect(page.locator('.menu-dishes--list').first()).toBeVisible();
});

test('sold out items remain displayed with their allergen details', async ({ page }) => {
  await page.goto('/demo/temas');
  const dish = page.getByRole('article', { name: 'Ensaladilla de gambas' });
  await expect(dish.getByText('Agotado', { exact: true })).toBeVisible();
  await expect(dish.getByText('Crustáceos')).toBeVisible();
});

test('live restaurant theme is loaded from PostgreSQL', async ({ page }) => {
  await page.goto('/r/demo-restaurante');
  await expect(page.getByTestId('restaurant-menu')).toHaveAttribute('data-theme', 'TERRACOTTA');
});
