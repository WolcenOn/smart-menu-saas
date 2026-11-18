import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const { BOOTSTRAP_CONFIRM, BOOTSTRAP_EMAIL, BOOTSTRAP_PASSWORD, BOOTSTRAP_RESTAURANT_NAME, BOOTSTRAP_RESTAURANT_SLUG } = process.env;
  if (BOOTSTRAP_CONFIRM !== 'CREATE_FIRST_OWNER') throw new Error('Bootstrap disabled');
  const email = BOOTSTRAP_EMAIL?.trim().toLowerCase();
  const name = BOOTSTRAP_RESTAURANT_NAME?.trim();
  const slug = BOOTSTRAP_RESTAURANT_SLUG?.trim();
  const password = BOOTSTRAP_PASSWORD;

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) throw new Error('Invalid bootstrap email');
  if (!password || password.length < 14 || password.length > 100 || !/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/[0-9]/.test(password) || !/[^a-zA-Z0-9]/.test(password)) throw new Error('Use a strong 14+ character password');
  if (!name || name.length > 160 || !slug || slug.length > 80 || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw new Error('Invalid restaurant name or slug');

  if (await prisma.user.findUnique({ where: { email } })) throw new Error('User exists; refusing to overwrite password');
  if (await prisma.restaurant.findUnique({ where: { slug } })) throw new Error('Restaurant exists; refusing to reassign');
  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.$transaction(async tx => {
    const user = await tx.user.create({ data: { email, passwordHash, name: 'Propietario' } });
    await tx.restaurant.create({
      data: {
        slug, name, themePreset: 'OLIVE',
        members: { create: { userId: user.id, role: 'OWNER' } },
        menus: { create: { name: 'Carta principal', published: true, categories: { create: { name: 'Para empezar', position: 1 } } } },
      },
    });
  });
  // No log passwords, hashes, or database URLs.
  console.log('Initial owner and restaurant created. Remove all BOOTSTRAP_* variables immediately.');
}

main().catch(error => { console.error('Bootstrap failed:', error instanceof Error ? error.message : 'unknown error'); process.exitCode = 1; }).finally(async () => prisma.$disconnect());
