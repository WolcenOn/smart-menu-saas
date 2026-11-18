import 'server-only';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';

export async function getCurrentUserId(): Promise<string | null> {
  const session = await auth();
  // Never use a client-provided userId or tenantId for authorization.
  if (!session?.user?.email) return null;
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });
  return user?.id ?? null;
}
