import { test, expect } from '@playwright/test';
import { PrismaClient } from '@prisma/client';
import { hashInvitationToken } from '../src/lib/invitation-tokens';

const adminSecret = 'ci-only-admin-long-random-like-key-for-testing-2026-1234567890';
const password = 'RegistrationTestPassword2026!';

async function adminLogin(page: import('@playwright/test').Page) {
  await page.goto('/admin');
  await expect(page).toHaveURL(/\/admin\/acceso/);
  await page.getByLabel('Clave de administración').fill(adminSecret);
  await page.getByRole('button', { name: 'Entrar en administración' }).click();
  await expect(page).toHaveURL(/\/admin$/);
}

async function issue(page: import('@playwright/test').Page, email: string, hours = '48') {
  await page.getByLabel('Correo del propietario').fill(email);
  await page.getByLabel('Caducidad').selectOption(hours);
  await page.getByRole('button', { name: 'Crear invitación' }).click();
  const url = await page.getByLabel('Enlace de invitación').inputValue();
  expect(url).toContain('/registro-restaurante/');
  return url;
}

test('administrator issues one-time invitation and owner creates a restaurant', async ({ page }) => {
  await adminLogin(page);
  const email = 'invited-' + crypto.randomUUID() + '@example.invalid';
  const name = 'Casa Prueba ' + crypto.randomUUID().slice(0, 8);
  const invitationUrl = await issue(page, email);

  await page.goto(invitationUrl);
  await expect(page.getByRole('heading', { name: 'Tu restaurante, listo para empezar.' })).toBeVisible();
  await expect(page.getByLabel('Correo invitado')).toHaveValue(email);
  await page.getByLabel('Nombre del restaurante').fill(name);
  await page.getByLabel('Tu nombre').fill('Dueña Demo');
  await page.getByLabel('Contraseña').fill(password);
  await page.getByRole('button', { name: 'Crear restaurante y acceder' }).click();
  // Registration and login are deliberately separate: once the transaction
  // commits, the invitation is consumed even if session creation fails.
  await expect(page).toHaveURL(/\/acceso\?created=1/);
  await expect(page.getByRole('status')).toContainText('Tu cuenta y tu restaurante se han creado correctamente');
  await page.getByLabel('Correo electrónico').fill(email.toUpperCase());
  await page.getByLabel('Contraseña').fill(password);
  await page.getByRole('button', { name: 'Entrar al panel' }).click();
  await expect(page).toHaveURL(/\/panel/);
  await expect(page.getByRole('heading', { name })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Restaurante de demostración' })).toHaveCount(0);

  const db = new PrismaClient();
  try {
    const token = invitationUrl.split('/').pop()!;
    const invite = await db.restaurantInvitation.findUnique({ where: { tokenHash: hashInvitationToken(token) } });
    expect(invite?.usedAt).not.toBeNull();
    expect(invite?.restaurantId).toBeTruthy();
    const user = await db.user.findUnique({ where: { email }, include: { memberships: true } });
    expect(user?.memberships).toHaveLength(1);
    expect(user?.memberships[0].role).toBe('OWNER');
  } finally { await db.$disconnect(); }

  await page.goto(invitationUrl);
  await expect(page.getByText(/ha caducado, ya se ha utilizado o ha sido revocado/)).toBeVisible();
  await expect(page.getByRole('button', { name: 'Crear restaurante y acceder' })).toHaveCount(0);
});

test('administrator can revoke and expire invitations', async ({ page }) => {
  await adminLogin(page);
  const email = 'revoked-' + crypto.randomUUID() + '@example.invalid';
  const url = await issue(page, email, '1');
  const row = page.locator('.admin-invite').filter({ hasText: email });
  await row.getByRole('button', { name: 'Revocar' }).click();
  await expect(row.getByText('Revocada')).toBeVisible();
  await page.goto(url);
  await expect(page.getByText(/ha caducado, ya se ha utilizado o ha sido revocado/)).toBeVisible();

  const expiredEmail = 'expired-' + crypto.randomUUID() + '@example.invalid';
  await page.goto('/admin');
  const expiryUrl = await issue(page, expiredEmail, '1');
  const db = new PrismaClient();
  try {
    const token = expiryUrl.split('/').pop()!;
    await db.restaurantInvitation.update({
      where: { tokenHash: hashInvitationToken(token) },
      data: { expiresAt: new Date(Date.now() - 1000) },
    });
  } finally { await db.$disconnect(); }
  await page.goto(expiryUrl);
  await expect(page.getByText(/ha caducado, ya se ha utilizado o ha sido revocado/)).toBeVisible();
});

test('admin session cannot be forged from regular restaurant sign in', async ({ page }) => {
  await page.goto('/admin');
  await expect(page).toHaveURL(/\/admin\/acceso/);
  await page.getByLabel('Clave de administración').fill('wrong-key-' + 'a'.repeat(64));
  await page.getByRole('button', { name: 'Entrar en administración' }).click();
  await expect(page.getByRole('alert')).toBeVisible();
  await page.goto('/admin');
  await expect(page).toHaveURL(/\/admin\/acceso/);
});

test('admin logout invalidates the scoped administrator session', async ({ page }) => {
  await adminLogin(page);
  await page.getByRole('button', { name: 'Cerrar sesión' }).click();
  await expect(page).toHaveURL(/\/admin\/acceso/);
  await page.goto('/admin');
  await expect(page).toHaveURL(/\/admin\/acceso/);
});
