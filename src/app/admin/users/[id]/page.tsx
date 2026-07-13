import { getUserStats } from '@/actions/stats';
import StatsClient from '@/components/StatsClient';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default async function AdminUserStatsPage({ params }: { params: { id: string } }) {
  const userId = parseInt(params.id);
  
  if (isNaN(userId)) {
    redirect('/admin');
  }

  const data = await getUserStats(userId);
  
  if (!data) {
    redirect('/admin');
  }

  return (
    <div>
      <div style={{ padding: '2rem 2rem 0 2rem' }}>
        <Link href="/admin" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.9rem' }}>
          <ArrowLeft size={16} /> Voltar para a Equipe
        </Link>
      </div>
      <StatsClient data={data} />
    </div>
  );
}
