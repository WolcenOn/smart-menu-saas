import 'server-only';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';
import { accountCanAuthenticate } from '@/lib/account-status';

// Resolve the user from the database, rather than trusting any browser input.
// This also checks that the account still exists.
export async function getCurrentUserId(): Promise<string | null> {
  const session = await auth();
  if (!session?.user?.id) return null;
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, suspendedAt: true, deletedAt: true },
  });
  return user && accountCanAuthenticate(user) ? user.id : null;
}
