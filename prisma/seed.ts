import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const allergens = [
  ['gluten', 'Cereales con gluten'], ['crustaceos', 'Crustáceos'],
  ['huevos', 'Huevos'], ['pescado', 'Pescado'],
  ['cacahuetes', 'Cacahuetes'], ['soja', 'Soja'],
  ['leche', 'Leche y derivados'], ['frutos-cascara', 'Frutos de cáscara'],
  ['apio', 'Apio'], ['mostaza', 'Mostaza'],
  ['sesamo', 'Sésamo'], ['sulfitos', 'Dióxido de azufre y sulfitos'],
  ['altramuces', 'Altramuces'], ['moluscos', 'Moluscos'],
] as const;

async function main() {
  for (const [id, name] of allergens) {
    await prisma.allergen.upsert({ where: { id }, update: { name }, create: { id, name } });
  }

  // E2E only: this deletes a fixture restaurant. Never enable outside disposable CI databases.
  if (process.env.E2E_TEST_SEED !== '1') return;

  const slug = 'demo-restaurante';
  const old = await prisma.restaurant.findUnique({ where: { slug }, select: { id: true } });
  if (old) await prisma.restaurant.delete({ where: { id: old.id } });

  await prisma.restaurant.create({
    data: {
      slug,
      name: 'Restaurante de demostración',
      tagline: 'Cocina mediterránea para compartir',
      themePreset: 'TERRACOTTA',
      menuLayout: 'CARDS',
      menus: { create: [{
        name: 'Carta principal', published: true,
        categories: { create: [{
          name: 'Entrantes', position: 1,
          dishes: { create: [
            {
              name: 'Croquetas caseras', description: 'Receta tradicional',
              price: '9.00', status: 'PUBLISHED', availability: 'AVAILABLE',
              allergensReviewedAt: new Date(),
              position: 1,
              allergens: { create: [{ allergen: { connect: { id: 'gluten' } } }, { allergen: { connect: { id: 'leche' } } }] },
            },
            {
              name: 'Arroz con bogavante', description: 'Especialidad de la casa',
              price: '24.00', status: 'PUBLISHED', availability: 'SOLD_OUT',
              allergensReviewedAt: new Date(), position: 2,
              allergens: { create: [{ allergen: { connect: { id: 'crustaceos' } } }] },
            },
            {
              name: '<img src=x onerror=alert(1)>', description: 'Texto no confiable para comprobar escape JSX',
              price: '1.00', status: 'PUBLISHED', availability: 'AVAILABLE',
              allergensReviewedAt: new Date(), position: 3,
            },
            {
              name: 'Plato no revisado', description: 'No debe publicarse',
              price: '2.00', status: 'PUBLISHED', availability: 'AVAILABLE',
              allergensReviewedAt: null, position: 4,
            },
          ] },
        }] },
      }] },
    },
  });
}

main().finally(() => prisma.$disconnect());
