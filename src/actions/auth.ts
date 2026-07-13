'use server';

import { db } from '@/lib/db';
import { login } from '@/lib/auth';
import { redirect } from 'next/navigation';

export async function authenticate(formData: FormData) {
  const email = formData.get('email')?.toString();
  const password = formData.get('password')?.toString();

  if (!email || !password) {
    return { error: 'E-mail e senha são obrigatórios' };
  }

  try {
    const users = await db.sql`SELECT * FROM users WHERE email = ${email} AND password = ${password}`;
    const user = users[0];

    if (!user) {
      return { error: 'Credenciais inválidas' };
    }

    // Create session
    await login({ id: user.id, role: user.role, name: user.name });
    
    return { success: true };
  } catch (error) {
    console.error('Login error:', error);
    return { error: 'Ocorreu um erro no servidor. Tente novamente.' };
  }
}
