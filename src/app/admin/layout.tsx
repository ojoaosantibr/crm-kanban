import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { LogOut, Users, Database } from 'lucide-react';
import Link from 'next/link';
import { logout } from '@/actions/logout';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  
  if (!session || session.user.role !== 'ADMIN') {
    redirect('/');
  }

  return (
    <div className="app-container">
      <aside className="sidebar">
        <div style={{ padding: '2rem 1.5rem', borderBottom: '1px solid var(--border-color)', textAlign: 'center' }}>
          <img src="/logo.png" alt="Easy Web Admin" style={{ maxWidth: '160px', margin: '0 auto' }} />
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '1rem' }}>
            Painel Administrativo
          </p>
        </div>

        <nav style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <Link href="/admin" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', color: 'white' }}>
            <Users size={20} /> Equipe e Leads
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

      <main className="main-content">
        {children}
      </main>
    </div>
  );
}
