'use server';

import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';

export async function getUserStats(targetUserId?: number) {
  const session = await getSession();
  if (!session) return null;

  // Apenas admins podem ver o status de outros usuários
  if (targetUserId && session.user.role !== 'ADMIN') {
    return null;
  }

  const userId = targetUserId || session.user.id;

  // Obter o usuário
  const users = await db.sql`SELECT id, name, email, current_streak, created_at FROM users WHERE id = ${userId}`;
  const user = users[0];

  if (!user) return null;

  // Obter o progresso dos últimos 30 dias ordenado do mais antigo pro mais novo (para gráficos)
  const history = await db.sql`
    SELECT target_date, calls_count, ig_messages_count, goal_met 
    FROM daily_progress 
    WHERE user_id = ${userId} 
      AND target_date >= CURRENT_DATE - INTERVAL '30 days'
    ORDER BY target_date ASC
  `;

  // Obter os totais (para cards de sumário)
  const totals = await db.sql`
    SELECT 
      SUM(calls_count) as total_calls, 
      SUM(ig_messages_count) as total_ig_messages,
      COUNT(id) as active_days,
      SUM(CASE WHEN goal_met THEN 1 ELSE 0 END) as goals_met_count
    FROM daily_progress 
    WHERE user_id = ${userId}
  `;

  return {
    user,
    history,
    totals: totals[0] || { total_calls: 0, total_ig_messages: 0, active_days: 0, goals_met_count: 0 }
  };
}
