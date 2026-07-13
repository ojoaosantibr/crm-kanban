import { getUserStats } from '@/actions/stats';
import StatsClient from '@/components/StatsClient';
import { redirect } from 'next/navigation';

export default async function StatsPage() {
  const data = await getUserStats();
  
  if (!data) {
    redirect('/');
  }

  return <StatsClient data={data} />;
}
