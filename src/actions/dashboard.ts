'use server';

import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';

export async function getUserDashboardData() {
  const session = await getSession();
  if (!session || session.user.role !== 'USER') {
    return null;
  }

  const userId = session.user.id;

  // Obter usuário
  const users = await db.sql`SELECT * FROM users WHERE id = ${userId}`;
  const user = users[0];

  if (!user) return null;

  // Obter leads
  const leads = await db.sql`SELECT * FROM leads WHERE assigned_to = ${userId} ORDER BY created_at DESC`;

  // Obter progresso diário
  const today = new Date().toISOString().split('T')[0];
  let dailyProgress = await db.sql`SELECT * FROM daily_progress WHERE user_id = ${userId} AND target_date = ${today}`;
  
  if (dailyProgress.length === 0) {
    // Inicializar progresso para hoje se não existir
    await db.sql`INSERT INTO daily_progress (user_id, target_date) VALUES (${userId}, ${today})`;
    dailyProgress = await db.sql`SELECT * FROM daily_progress WHERE user_id = ${userId} AND target_date = ${today}`;
  }

  return {
    user,
    leads,
    progress: dailyProgress[0]
  };
}

export async function logActivity(type: 'CALL' | 'IG_MESSAGE') {
  const session = await getSession();
  if (!session || session.user.role !== 'USER') return { error: 'Unauthorized' };

  const userId = session.user.id;
  const today = new Date().toISOString().split('T')[0];

  // Garantir que o progresso de hoje exista
  let progress = await db.sql`SELECT * FROM daily_progress WHERE user_id = ${userId} AND target_date = ${today}`;
  if (progress.length === 0) {
    await db.sql`INSERT INTO daily_progress (user_id, target_date) VALUES (${userId}, ${today})`;
  }

  // Inserir registro de atividade
  await db.sql`INSERT INTO activities (user_id, activity_type) VALUES (${userId}, ${type})`;

  // Atualizar contadores diários
  if (type === 'CALL') {
    await db.sql`UPDATE daily_progress SET calls_count = calls_count + 1 WHERE user_id = ${userId} AND target_date = ${today}`;
  } else {
    await db.sql`UPDATE daily_progress SET ig_messages_count = ig_messages_count + 1 WHERE user_id = ${userId} AND target_date = ${today}`;
  }

  // Checar se a meta foi batida
  progress = await db.sql`SELECT * FROM daily_progress WHERE user_id = ${userId} AND target_date = ${today}`;
  const p = progress[0];

  if (!p.goal_met && p.calls_count >= 10 && p.ig_messages_count >= 10) {
    // Bateu a meta hoje
    await db.sql`UPDATE daily_progress SET goal_met = TRUE WHERE id = ${p.id}`;
    // Atualizar streak do usuário
    await db.sql`UPDATE users SET current_streak = current_streak + 1 WHERE id = ${userId}`;
    return { success: true, goalMet: true };
  }

  return { success: true, goalMet: false };
}

export async function updateLeadStatus(leadId: number, status: string) {
  const session = await getSession();
  if (!session) return { error: 'Unauthorized' };

  await db.sql`UPDATE leads SET status = ${status} WHERE id = ${leadId} AND assigned_to = ${session.user.id}`;
  return { success: true };
}
