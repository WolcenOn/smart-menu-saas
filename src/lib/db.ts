import 'server-only';
import { PrismaClient } from '@prisma/client';

const holder = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = holder.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
});

if (process.env.NODE_ENV !== 'production') holder.prisma = prisma;
