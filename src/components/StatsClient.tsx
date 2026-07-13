'use client';

import { Flame, Phone, MessageCircle, Calendar, Target, Award } from 'lucide-react';
import { motion } from 'framer-motion';

export default function StatsClient({ data }: { data: any }) {
  const { user, history, totals } = data;

  // Garantir valores padrão caso não haja histórico
  const totalCalls = Number(totals.total_calls) || 0;
  const totalIg = Number(totals.total_ig_messages) || 0;
  const goalsMet = Number(totals.goals_met_count) || 0;
  
  // Extrair datas para o gráfico de barras dos últimos 7-30 dias
  // Vamos exibir no máximo os últimos 14 dias para caber bem na tela
  const recentHistory = history.slice(-14);

  return (
    <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      <div>
        <h2 style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>Meu Progresso</h2>
        <p style={{ color: 'var(--text-muted)' }}>Acompanhe seu desempenho e metas atingidas.</p>
      </div>

      {/* Cards de Resumo */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
        
        <div className="glass" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'rgba(249, 115, 22, 0.1)', padding: '1rem', borderRadius: '12px' }}>
            <Flame className="fire-icon" size={28} />
          </div>
          <div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Ofensiva Atual</p>
            <h3 style={{ fontSize: '1.5rem' }}>{user.current_streak} dias</h3>
          </div>
        </div>

        <div className="glass" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'rgba(59, 130, 246, 0.1)', color: 'var(--primary)', padding: '1rem', borderRadius: '12px' }}>
            <Phone size={28} />
          </div>
          <div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Total Ligações</p>
            <h3 style={{ fontSize: '1.5rem' }}>{totalCalls}</h3>
          </div>
        </div>

        <div className="glass" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'rgba(168, 85, 247, 0.1)', color: 'var(--secondary)', padding: '1rem', borderRadius: '12px' }}>
            <MessageCircle size={28} />
          </div>
          <div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Total DMs</p>
            <h3 style={{ fontSize: '1.5rem' }}>{totalIg}</h3>
          </div>
        </div>

        <div className="glass" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', padding: '1rem', borderRadius: '12px' }}>
            <Award size={28} />
          </div>
          <div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Metas Batidas</p>
            <h3 style={{ fontSize: '1.5rem' }}>{goalsMet} dias</h3>
          </div>
        </div>
      </div>

      {/* Gráfico de Desempenho Recente (Visualização em Barras CSS) */}
      <div className="glass" style={{ padding: '2rem' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
          <Calendar size={20} color="var(--primary)" /> Desempenho Recente (Últimos 14 dias)
        </h3>

        {recentHistory.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem 0' }}>Nenhum dado registrado ainda.</p>
        ) : (
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1rem', height: '200px', overflowX: 'auto', paddingBottom: '1rem' }}>
            {recentHistory.map((day: any, i: number) => {
              const maxVal = Math.max(...recentHistory.map((d: any) => Math.max(d.calls_count, d.ig_messages_count, 10)));
              const callsHeight = (day.calls_count / maxVal) * 100;
              const igHeight = (day.ig_messages_count / maxVal) * 100;
              const date = new Date(day.target_date);
              
              return (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', flex: 1, minWidth: '40px' }}>
                  
                  {/* Tooltip Hover Area */}
                  <div style={{ display: 'flex', gap: '4px', height: '150px', alignItems: 'flex-end', width: '100%', justifyContent: 'center' }} title={`Ligações: ${day.calls_count} | DMs: ${day.ig_messages_count}`}>
                    {/* Barra Ligações */}
                    <motion.div 
                      initial={{ height: 0 }}
                      animate={{ height: `${callsHeight}%` }}
                      style={{ width: '12px', background: 'var(--primary)', borderRadius: '4px 4px 0 0', opacity: 0.9 }}
                    />
                    {/* Barra IG Messages */}
                    <motion.div 
                      initial={{ height: 0 }}
                      animate={{ height: `${igHeight}%` }}
                      style={{ width: '12px', background: 'var(--secondary)', borderRadius: '4px 4px 0 0', opacity: 0.9 }}
                    />
                  </div>

                  <div style={{ fontSize: '0.75rem', color: day.goal_met ? 'var(--success)' : 'var(--text-muted)', fontWeight: day.goal_met ? 'bold' : 'normal' }}>
                    {date.getDate()}/{date.getMonth() + 1}
                  </div>
                </div>
              );
            })}
          </div>
        )}
        
        <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', marginTop: '1.5rem', fontSize: '0.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: '12px', height: '12px', background: 'var(--primary)', borderRadius: '2px' }}></div>
            <span>Ligações</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: '12px', height: '12px', background: 'var(--secondary)', borderRadius: '2px' }}></div>
            <span>Mensagens IG</span>
          </div>
        </div>
      </div>
      
    </div>
  );
}
