import { createAdminClient } from '@/lib/supabase/admin';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Users, ArrowLeftRight, UserCheck, Activity, Clock, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export default async function AdminDashboardPage() {
  const supabase = createAdminClient();
  
  let users: any[] = [];
  try {
    const { data: usersData } = await supabase.auth.admin.listUsers();
    users = usersData?.users || [];
  } catch (error) {
    console.error('Failed to fetch users (make sure SERVICE_ROLE_KEY is set):', error);
  }

  const totalUsers = users.length;
  
  // Recent users
  const recentUsers = [...users].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 5);
  
  // Fetch profiles for recent users
  const userIds = users.map(u => u.id);
  let profiles: any[] = [];
  if (userIds.length > 0) {
    const { data } = await supabase.from('profiles').select('*').in('id', userIds);
    if (data) profiles = data;
  }
  
  const mappedRecentUsers = recentUsers.map(u => ({
    ...u,
    profile: profiles.find(p => p.id === u.id)
  }));

  const { count: peopleCount } = await supabase.from('people').select('*', { count: 'exact', head: true });
  const { count: transactionsCount } = await supabase.from('transactions').select('*', { count: 'exact', head: true });
  
  // Fetch recent transactions
  const { data: recentTransactions } = await supabase
    .from('transactions')
    .select(`
      id,
      amount,
      type,
      transaction_date,
      created_at,
      user_id,
      people (
        name
      )
    `)
    .order('created_at', { ascending: false })
    .limit(5);

  const mappedRecentTransactions = (recentTransactions || []).map(tx => {
    const userProfile = profiles.find(p => p.id === tx.user_id);
    const userEmail = users.find(u => u.id === tx.user_id)?.email;
    const personName = Array.isArray(tx.people) ? tx.people[0]?.name : (tx.people as any)?.name;
    return {
      ...tx,
      userName: userProfile?.full_name || userEmail || 'Unknown User',
      personName: personName || 'Unknown'
    };
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Platform Overview</h2>
        <p className="text-muted-foreground">High-level statistics and recent activity across the platform.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="glass-panel">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Registered Users</CardTitle>
            <UserCheck className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
            <p className="text-xs text-muted-foreground mt-1">Authenticated accounts</p>
          </CardContent>
        </Card>
        
        <Card className="glass-panel">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total People Tracked</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{peopleCount || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Customers, suppliers, etc.</p>
          </CardContent>
        </Card>

        <Card className="glass-panel">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
            <ArrowLeftRight className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{transactionsCount || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Global ledger entries</p>
          </CardContent>
        </Card>

        <Card className="glass-panel">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Platform Status</CardTitle>
            <Activity className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">Healthy</div>
            <p className="text-xs text-muted-foreground mt-1">All services running</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="glass-panel">
          <CardHeader>
            <CardTitle>Recent Registered Users</CardTitle>
            <CardDescription>The latest accounts created on the platform.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {mappedRecentUsers.length > 0 ? (
                mappedRecentUsers.map((user) => (
                  <div key={user.id} className="flex items-center">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {(user.profile?.full_name || user.email || 'U').charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="ml-4 space-y-1">
                      <p className="text-sm font-medium leading-none">{user.profile?.full_name || 'N/A'}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                    <div className="ml-auto font-medium text-xs text-muted-foreground">
                      {format(new Date(user.created_at), 'dd MMM yyyy')}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-sm text-muted-foreground py-4 text-center">No recent users.</div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="glass-panel">
          <CardHeader>
            <CardTitle>Global Recent Transactions</CardTitle>
            <CardDescription>The latest ledger activities across all users.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {mappedRecentTransactions.length > 0 ? (
                mappedRecentTransactions.map((tx) => {
                  const isPositive = tx.type === 'RECEIVED' || tx.type === 'BORROWED';
                  
                  return (
                    <div key={tx.id} className="flex items-center">
                      <div className={`p-2 rounded-full ${isPositive ? 'bg-primary/10 text-primary' : 'bg-red-500/10 text-red-500'}`}>
                        {isPositive ? <ArrowDownLeft className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                      </div>
                      <div className="ml-4 space-y-1">
                        <p className="text-sm font-medium leading-none">
                          <span className="opacity-70 font-normal">{tx.userName}</span> &rarr; {tx.personName}
                        </p>
                        <div className="flex items-center text-xs text-muted-foreground gap-2">
                          <Badge variant="outline" className="text-[10px] py-0">{tx.type}</Badge>
                          <span>{format(new Date(tx.transaction_date), 'MMM dd, yyyy')}</span>
                        </div>
                      </div>
                      <div className={`ml-auto font-medium ${isPositive ? 'text-primary' : 'text-red-500'}`}>
                        {isPositive ? '+' : '-'}৳{tx.amount.toFixed(2)}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-sm text-muted-foreground py-4 text-center">No recent transactions.</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
