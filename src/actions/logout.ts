'use server';

import { logout as destroySession } from '@/lib/auth';
import { redirect } from 'next/navigation';

export async function logout() {
  await destroySession();
  redirect('/');
}
