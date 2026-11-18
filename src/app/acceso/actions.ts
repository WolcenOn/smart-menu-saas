'use server';

import { signIn } from '@/auth';
import { AuthError } from 'next-auth';
import { redirect } from 'next/navigation';

export async function loginWithPassword(formData: FormData) {
  const email = formData.get('email');
  const password = formData.get('password');
  if (typeof email !== 'string' || typeof password !== 'string') {
    redirect('/acceso?error=invalid');
  }
  try {
    await signIn('credentials', { email, password, redirectTo: '/panel' });
  } catch (error) {
    if (error instanceof AuthError) redirect('/acceso?error=invalid');
    throw error; // Preserve Next.js redirect exceptions.
  }
}
