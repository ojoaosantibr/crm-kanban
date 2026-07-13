'use client';

import { useState } from 'react';
import { Flame, Phone, MessageCircle, DollarSign, CheckCircle2 } from 'lucide-react';
import { logActivity, updateLeadStatus } from '@/actions/dashboard';
import { motion, AnimatePresence } from 'framer-motion';

const COLUMNS = ['Lead Novo', 'Contato Inicial', 'Em Negociação', 'Fechado'];

export default function UserDashboardClient({ initialUser, initialLeads, initialProgress }: any) {
  const [user, setUser] = useState(initialUser);
  const [leads, setLeads] = useState(initialLeads);
  const [progress, setProgress] = useState(initialProgress || { calls_count: 0, ig_messages_count: 0, goal_met: false });
  const [isLogging, setIsLogging] = useState(false);

  const handleLogActivity = async (type: 'CALL' | 'IG_MESSAGE') => {
    if (isLogging) return;
    setIsLogging(true);
    
    try {
      // Optimistic UI update
      const isCall = type === 'CALL';
      const newProgress = {
        ...progress,
        calls_count: Number(progress.calls_count || 0) + (isCall ? 1 : 0),
        ig_messages_count: Number(progress.ig_messages_count || 0) + (!isCall ? 1 : 0),
      };
      
      // Check goal met locally for immediate animation
      if (!newProgress.goal_met && newProgress.calls_count >= 10 && newProgress.ig_messages_count >= 10) {
        newProgress.goal_met = true;
        setUser({...user, current_streak: Number(user.current_streak || 0) + 1});
      }
      setProgress(newProgress);

      await logActivity(type);
    } catch (e) {
      console.error(e);
      // Aqui poderíamos reverter o estado otimista, mas no MVP apenas logamos
    } finally {
      setIsLogging(false);
    }
  };

  const handleDragStart = (e: React.DragEvent, leadId: number) => {
    e.dataTransfer.setData('leadId', leadId.toString());
  };

  const handleDrop = async (e: React.DragEvent, status: string) => {
    e.preventDefault();
    const leadId = parseInt(e.dataTransfer.getData('leadId'));
    
    // Optimistic update
    setLeads(leads.map((l: any) => l.id === leadId ? { ...l, status } : l));
    
    // API Call
    await updateLeadStatus(leadId, status);
  };

  const requestWithdrawal = () => {
    alert("Solicitação enviada por e-mail para o Administrador!");
  };

  return (
    <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem', height: '100%' }}>
      {/* Top Bar / Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
        
        {/* Streak Card */}
        <div className="glass" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'rgba(249, 115, 22, 0.1)', padding: '1rem', borderRadius: '12px' }}>
            <Flame className="fire-icon" size={32} />
          </div>
          <div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Ofensiva Atual</p>
            <h3 style={{ fontSize: '1.8rem' }}>{user.current_streak} dias</h3>
          </div>
        </div>

        {/* Balance Card */}
        <div className="glass" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', padding: '1rem', borderRadius: '12px' }}>
              <DollarSign size={32} />
            </div>
            <div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Saldo Disponível</p>
              <h3 style={{ fontSize: '1.8rem' }}>R$ {Number(user.balance).toFixed(2)}</h3>
            </div>
          </div>
          <button onClick={requestWithdrawal} className="btn btn-outline" style={{ fontSize: '0.8rem', padding: '0.5rem 1rem' }}>
            Solicitar Saque
          </button>
        </div>

        {/* Daily Goals */}
        <div className="glass" style={{ padding: '1.5rem', gridColumn: 'span 2' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                Metas de Hoje {progress.goal_met && <CheckCircle2 color="var(--success)" size={20} />}
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Realize as metas para manter sua ofensiva</p>
            </div>
            
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button onClick={() => handleLogActivity('CALL')} className="btn btn-primary" style={{ background: 'var(--bg-panel)', border: '1px solid var(--primary)', color: 'var(--text-main)' }}>
                <Phone size={16} color="var(--primary)" /> +1 Ligação
              </button>
              <button onClick={() => handleLogActivity('IG_MESSAGE')} className="btn btn-primary" style={{ background: 'var(--bg-panel)', border: '1px solid var(--secondary)', color: 'var(--text-main)' }}>
                <MessageCircle size={16} color="var(--secondary)" /> +1 Direct IG
              </button>
            </div>
          </div>

          {/* Progress Bars */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.3rem' }}>
                <span>Ligações ({progress.calls_count}/10)</span>
                <span style={{ color: progress.calls_count >= 10 ? 'var(--success)' : 'var(--text-muted)' }}>
                  {Math.min((progress.calls_count / 10) * 100, 100).toFixed(0)}%
                </span>
              </div>
              <div style={{ height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((progress.calls_count / 10) * 100, 100)}%` }}
                  style={{ height: '100%', background: 'var(--primary)', borderRadius: '4px' }}
                />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.3rem' }}>
                <span>Mensagens IG ({progress.ig_messages_count}/10)</span>
                <span style={{ color: progress.ig_messages_count >= 10 ? 'var(--success)' : 'var(--text-muted)' }}>
                  {Math.min((progress.ig_messages_count / 10) * 100, 100).toFixed(0)}%
                </span>
              </div>
              <div style={{ height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((progress.ig_messages_count / 10) * 100, 100)}%` }}
                  style={{ height: '100%', background: 'var(--secondary)', borderRadius: '4px' }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <div style={{ flex: 1, display: 'flex', gap: '1.5rem', overflowX: 'auto', paddingBottom: '1rem' }}>
        {COLUMNS.map(col => (
          <div 
            key={col} 
            className="glass"
            style={{ flex: '1', minWidth: '300px', display: 'flex', flexDirection: 'column', background: 'rgba(22, 25, 37, 0.4)' }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleDrop(e, col)}
          >
            <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', fontWeight: '600' }}>
              {col} <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginLeft: '0.5rem' }}>{leads.filter((l: any) => l.status === col).length}</span>
            </div>
            <div style={{ padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto' }}>
              <AnimatePresence>
                {leads.filter((l: any) => l.status === col).map((lead: any) => (
                  <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    key={lead.id}
                    draggable
                    onDragStart={(e: any) => handleDragStart(e, lead.id)}
                    style={{ 
                      background: 'var(--bg-card)', 
                      padding: '1rem', 
                      borderRadius: '8px', 
                      border: '1px solid var(--border-color)',
                      cursor: 'grab' 
                    }}
                  >
                    <h4 style={{ marginBottom: '0.5rem' }}>{lead.name}</h4>
                    {lead.ig_link && <a href={lead.ig_link} target="_blank" rel="noreferrer" style={{ fontSize: '0.8rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.3rem' }}><MessageCircle size={12} /> Instagram</a>}
                    {lead.phone && <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Phone size={12} /> {lead.phone}</p>}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
