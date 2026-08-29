import { createAdminClient } from '@/lib/supabase/admin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, ArrowLeftRight, UserCheck } from 'lucide-react';

export default async function AdminDashboardPage() {
  const supabase = createAdminClient();
  
  let totalUsers = 0;
  try {
    const { data: usersData } = await supabase.auth.admin.listUsers();
    totalUsers = usersData?.users?.length || 0;
  } catch (error) {
    console.error('Failed to fetch users (make sure SERVICE_ROLE_KEY is set):', error);
  }

  const { count: peopleCount } = await supabase.from('people').select('*', { count: 'exact', head: true });
  const { count: transactionsCount } = await supabase.from('transactions').select('*', { count: 'exact', head: true });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Platform Overview</h2>
        <p className="text-muted-foreground">High-level statistics across all users.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="glass-panel">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Registered Users</CardTitle>
            <UserCheck className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
          </CardContent>
        </Card>
        
        <Card className="glass-panel">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total People Tracked</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{peopleCount || 0}</div>
          </CardContent>
        </Card>

        <Card className="glass-panel">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
            <ArrowLeftRight className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{transactionsCount || 0}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
