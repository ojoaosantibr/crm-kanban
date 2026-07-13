import { getUserDashboardData } from '@/actions/dashboard';
import UserDashboardClient from '@/components/UserDashboardClient';

export default async function DashboardPage() {
  const data = await getUserDashboardData();

  if (!data) {
    return <div>Erro ao carregar dados do usuário.</div>;
  }

  return (
    <UserDashboardClient 
      initialUser={data.user} 
      initialLeads={data.leads} 
      initialProgress={data.progress} 
    />
  );
}
