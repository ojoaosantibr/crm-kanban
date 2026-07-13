import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { LogOut, LayoutDashboard, Flame, Target, DollarSign, Phone, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import { logout } from '@/actions/logout';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  
  if (!session || session.user.role !== 'USER') {
    redirect('/');
  }

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div style={{ padding: '2rem 1.5rem', borderBottom: '1px solid var(--border-color)', textAlign: 'center' }}>
          <img src="/logo.png" alt="Easy Web CRM" style={{ maxWidth: '160px', margin: '0 auto' }} />
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '1rem' }}>
            Olá, {session.user.name}
          </p>
        </div>

        <nav style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', color: 'white' }}>
            <LayoutDashboard size={20} /> Quadro Kanban
          </Link>
          <Link href="/dashboard/stats" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', borderRadius: '8px', color: 'var(--text-muted)', transition: 'color 0.2s' }}>
            <Target size={20} /> Meu Progresso
          </Link>
        </nav>

        <div style={{ padding: '1.5rem', borderTop: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <form action={logout}>
            <button type="submit" className="btn btn-outline" style={{ width: '100%', display: 'flex', justifyContent: 'flex-start', color: 'var(--danger)', borderColor: 'var(--border-color)' }}>
              <LogOut size={18} /> Sair
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}
