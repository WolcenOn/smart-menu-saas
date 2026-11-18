import { expect, test } from '@playwright/test';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const password = 'OwnerForAdminAccessTesting2026!';
const adminKey = 'ci-only-admin-long-random-like-key-for-testing-2026-1234567890';

test('administrator can pause, restore and permanently remove account access while retaining restaurant history', async ({ page }) => {
  const db = new PrismaClient();
  const suffix = crypto.randomUUID().slice(0, 10);
  const email = 'admin-account-' + suffix + '@example.invalid';
  const restaurantName = 'Cocina Histórica ' + suffix;
  const user = await db.user.create({
    data: {
      name: 'Dueño de pruebas',
      email,
      passwordHash: await bcrypt.hash(password, 10),
      memberships: {
        create: {
          role: 'OWNER',
          restaurant: { create: { slug: 'historico-' + suffix, name: restaurantName } },
        },
      },
    },
    select: { id: true },
  });
  await db.$disconnect();

  const signIn = async () => {
    await page.goto('/acceso');
    await page.getByLabel('Correo electrónico').fill(email);
    await page.getByLabel('Contraseña').fill(password);
    await page.getByRole('button', { name: 'Entrar al panel' }).click();
  };
  await signIn();
  await expect(page).toHaveURL(/\/panel(?:\?|$)/);
  await expect(page.getByRole('heading', { name: restaurantName })).toBeVisible();

  await page.goto('/admin/acceso');
  await page.getByLabel('Clave de administración').fill(adminKey);
  await page.getByRole('button', { name: 'Entrar en administración' }).click();
  await expect(page).toHaveURL(/\/admin$/);

  const row = page.getByRole('article', { name: 'Cuenta de ' + email });
  await expect(row.getByText(restaurantName)).toBeVisible();
  await row.getByRole('button', { name: 'Pausar acceso' }).click();
  await expect(row.getByText('Pausado')).toBeVisible();

  // Existing Auth.js JWT must no longer grant access after the pause.
  await page.goto('/panel');
  await expect(page).toHaveURL(/\/acceso(?:\?|$)/);
  await signIn();
  await expect(page.getByRole('alert')).toBeVisible();
  await page.goto('/admin');
  await page.getByRole('article', { name: 'Cuenta de ' + email })
    .getByRole('button', { name: 'Reactivar acceso' }).click();

  await signIn();
  await expect(page).toHaveURL(/\/panel(?:\?|$)/);
  await page.goto('/admin');
  const activeRow = page.getByRole('article', { name: 'Cuenta de ' + email });
  await activeRow.getByText('Eliminar acceso definitivamente').click();
  await activeRow.getByPlaceholder(email).fill(email);
  await activeRow.getByRole('button', { name: 'Confirmar eliminación del acceso' }).click();
  await expect(activeRow.getByText('Acceso eliminado')).toBeVisible();
  await expect(activeRow.getByText(restaurantName)).toBeVisible();

  await page.goto('/panel');
  await expect(page).toHaveURL(/\/acceso(?:\?|$)/);
  await signIn();
  await expect(page.getByRole('alert')).toBeVisible();

  const verification = new PrismaClient();
  try {
    const archived = await verification.user.findUnique({
      where: { id: user.id },
      include: { memberships: { include: { restaurant: true } } },
    });
    expect(archived?.deletedAt).not.toBeNull();
    expect(archived?.passwordHash).toBeNull();
    expect(archived?.memberships[0].restaurant.name).toBe(restaurantName);
    const audits = await verification.adminAuditEvent.findMany({ where: { userId: user.id } });
    expect(audits.map(a => a.action).sort()).toEqual([
      'ACCOUNT_ACCESS_REMOVED', 'ACCOUNT_PAUSED', 'ACCOUNT_RESUMED',
    ]);
  } finally {
    await verification.$disconnect();
  }
});
