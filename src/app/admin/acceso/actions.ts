'use server';
import { redirect } from 'next/navigation';
import { matchesAdminKey } from '@/lib/invitation-tokens';
import { startAdminSession } from '@/lib/admin-session';

export async function adminLogin(form: FormData) {
  const secret = form.get('adminKey');
  if (typeof secret !== 'string' || secret.length > 1024 || !matchesAdminKey(secret)) {
    redirect('/admin/acceso?error=invalid');
  }
  await startAdminSession();
  redirect('/admin');
}
