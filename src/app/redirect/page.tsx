import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function RedirectPage() {
  const session = await getSession();
  
  if (!session) {
    redirect('/');
  }
  
  if (session.user.role === 'ADMIN') {
    redirect('/admin');
  } else {
    redirect('/dashboard');
  }
}
