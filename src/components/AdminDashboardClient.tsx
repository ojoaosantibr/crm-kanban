'use client';

import { useState } from 'react';
import { uploadLeadsExcel, assignLead, addBalance } from '@/actions/admin';
import { Upload, DollarSign, User, Link as LinkIcon, RefreshCw } from 'lucide-react';

export default function AdminDashboardClient({ initialUsers, initialLeads }: any) {
  const [users, setUsers] = useState(initialUsers);
  const [leads, setLeads] = useState(initialLeads);
  const [isUploading, setIsUploading] = useState(false);
  const [balanceAmount, setBalanceAmount] = useState<{ [key: number]: string }>({});

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', e.target.files[0]);

    const res = await uploadLeadsExcel(formData);
    setIsUploading(false);
    
    if (res?.success) {
      alert("Leads importados com sucesso! Atualize a página para ver os novos leads.");
      window.location.reload();
    } else {
      alert("Erro ao importar leads.");
    }
  };

  const handleAssignLead = async (leadId: number, userId: number | null) => {
    // Optimistic
    setLeads(leads.map((l: any) => l.id === leadId ? { ...l, assigned_to: userId } : l));
    await assignLead(leadId, userId);
  };

  const handleAddBalance = async (userId: number) => {
    const amount = parseFloat(balanceAmount[userId]);
    if (isNaN(amount) || amount <= 0) return;

    // Optimistic
    setUsers(users.map((u: any) => u.id === userId ? { ...u, balance: Number(u.balance) + amount } : u));
    setBalanceAmount({ ...balanceAmount, [userId]: '' });

    await addBalance(userId, amount);
  };

  return (
    <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2>Visão Geral da Equipe</h2>
          <p style={{ color: 'var(--text-muted)' }}>Gerencie usuários, saldo e distribuição de leads.</p>
        </div>
        <div>
          <label className="btn btn-primary" style={{ cursor: 'pointer' }}>
            {isUploading ? <RefreshCw className="animate-spin" size={18} /> : <Upload size={18} />}
            {isUploading ? 'Processando...' : 'Importar Excel (.xlsx)'}
            <input type="file" accept=".xlsx, .xls" style={{ display: 'none' }} onChange={handleUpload} disabled={isUploading} />
          </label>
        </div>
      </div>

      {/* Users List */}
      <div className="glass" style={{ padding: '1.5rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>Membros da Equipe</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {users.map((user: any) => (
            <div key={user.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ background: 'var(--bg-dark)', padding: '0.8rem', borderRadius: '50%' }}>
                  <User size={20} color="var(--primary)" />
                </div>
                <div>
                  <h4>{user.name}</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{user.email} • Ofensiva: 🔥 {user.current_streak} dias</p>
                  <a href={`/admin/users/${user.id}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem', color: 'var(--primary)', marginTop: '0.5rem', textDecoration: 'none' }}>
                    <LinkIcon size={14} /> Ver Progresso
                  </a>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Saldo Atual</p>
                  <p style={{ fontWeight: '600', color: 'var(--success)' }}>R$ {Number(user.balance).toFixed(2)}</p>
                </div>
                
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input 
                    type="number" 
                    placeholder="Valor" 
                    className="input-field" 
                    style={{ width: '100px', padding: '0.5rem' }} 
                    value={balanceAmount[user.id] || ''}
                    onChange={(e) => setBalanceAmount({ ...balanceAmount, [user.id]: e.target.value })}
                  />
                  <button onClick={() => handleAddBalance(user.id)} className="btn btn-outline" style={{ padding: '0.5rem' }}>
                    <DollarSign size={16} /> Adicionar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Leads Management */}
      <div className="glass" style={{ padding: '1.5rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>Distribuição de Leads ({leads.length})</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
          {leads.map((lead: any) => (
            <div key={lead.id} style={{ padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <h4 style={{ marginBottom: '0.5rem' }}>{lead.name}</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>Status: {lead.status}</p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Atribuído a:</label>
                <select 
                  className="input-field" 
                  value={lead.assigned_to || ""} 
                  onChange={(e) => handleAssignLead(lead.id, e.target.value ? parseInt(e.target.value) : null)}
                  style={{ padding: '0.5rem' }}
                >
                  <option value="">Não Atribuído</option>
                  {users.map((u: any) => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
