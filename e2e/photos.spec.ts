import { expect, test } from '@playwright/test';

test('owners can see the secure photo uploader, disabled safely without configured S3', async ({ page }) => {
  await page.goto('/acceso');
  await page.getByLabel('Correo electrónico').fill('e2e-owner@example.invalid');
  await page.getByLabel('Contraseña').fill('E2e-Only-Strong-Password-2026!');
  await page.getByRole('button', { name: 'Entrar al panel' }).click();
  await expect(page).toHaveURL(/\/panel(?:\?|$)/);
  await page.getByRole('link', { name: 'Editar carta' }).click();
  const editor = page.getByRole('article', { name: 'Gestión de Croquetas caseras' });
  await expect(editor.getByLabel('Fotografía del plato')).toBeVisible();
  await expect(editor.getByRole('button', { name: 'Guardar fotografía' })).toBeVisible();

  // This CI run has no S3 credentials: authenticated users must receive a
  // clear 503 rather than a CSRF/origin rejection or a server exception.
  const pixel = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/R4YAAAAASUVORK5CYII=',
    'base64',
  );
  await editor.locator('input[name="photo"]').setInputFiles({
    name: 'pixel.png', mimeType: 'image/png', buffer: pixel,
  });
  await editor.getByRole('button', { name: 'Guardar fotografía' }).click();
  await expect(editor.getByText('El almacenamiento de fotos aún no está configurado.')).toBeVisible();
});

test('public clients cannot acquire signed upload URLs', async ({ page }) => {
  await page.goto('/demo/temas');
  const response = await page.evaluate(async () => {
    const res = await fetch('/api/dishes/cjld2cjxh0000qzrmn831i7rn/photos/start', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bytes: 1024 }),
    });
    return res.status;
  });
  expect(response).toBe(404);
});
