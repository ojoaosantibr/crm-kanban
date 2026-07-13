import { getAdminData } from '@/actions/admin';
import AdminDashboardClient from '@/components/AdminDashboardClient';

export default async function AdminPage() {
  const data = await getAdminData();

  if (!data) return <div>Acesso negado.</div>;

  return <AdminDashboardClient initialUsers={data.users} initialLeads={data.leads} />;
}
