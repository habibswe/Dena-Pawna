import { createAdminClient } from '@/lib/supabase/admin';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Users, ArrowLeftRight, UserCheck, Activity, TrendingUp, TrendingDown, Wallet, LayoutList, PieChart } from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';

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
  
  // Calculate active users (logged in within last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const activeUsers = users.filter(u => u.last_sign_in_at && new Date(u.last_sign_in_at) > thirtyDaysAgo).length;
  
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
  const { count: categoriesCount } = await supabase.from('categories').select('*', { count: 'exact', head: true });
  const { count: budgetsCount } = await supabase.from('budgets').select('*', { count: 'exact', head: true });
  
  // Fetch all transactions to calculate global metrics
  const { data: allTransactionsData } = await supabase.from('transactions').select('amount, type');
  const allTxs = allTransactionsData || [];
  
  let totalMoney = 0;
  let totalIncome = 0;
  let totalExpense = 0;
  let totalLent = 0;
  let totalBorrowed = 0;

  allTxs.forEach(tx => {
    const amt = Number(tx.amount) || 0;
    totalMoney += amt;
    if (tx.type === 'INCOME') totalIncome += amt;
    else if (tx.type === 'EXPENSE') totalExpense += amt;
    else if (tx.type === 'GIVEN') totalLent += amt;
    else if (tx.type === 'RECEIVED' || tx.type === 'BORROWED') totalBorrowed += amt;
  });
  
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
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Platform Overview</h2>
          <p className="text-muted-foreground">High-level statistics and recent activity across the platform.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/super-admin/users" className={buttonVariants({ variant: 'default' })}>
            Manage Users
          </Link>
        </div>
      </div>

      {/* Global Financial Metrics */}
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
        <Card className="glass-panel border-primary/20 bg-primary/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Volume</CardTitle>
            <Wallet className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">৳{totalMoney.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">Total money tracked globally</p>
          </CardContent>
        </Card>

        <Card className="glass-panel">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-500">৳{totalIncome.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">Across all users</p>
          </CardContent>
        </Card>

        <Card className="glass-panel">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <TrendingDown className="h-4 w-4 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-rose-500">৳{totalExpense.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">Across all users</p>
          </CardContent>
        </Card>

        <Card className="glass-panel">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Lent</CardTitle>
            <ArrowLeftRight className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">৳{totalLent.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">Given to others</p>
          </CardContent>
        </Card>

        <Card className="glass-panel">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Borrowed</CardTitle>
            <ArrowLeftRight className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-500">৳{totalBorrowed.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">Received from others</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="glass-panel">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active / Total Users</CardTitle>
            <UserCheck className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeUsers} <span className="text-lg font-normal text-muted-foreground">/ {totalUsers}</span></div>
            <p className="text-xs text-muted-foreground mt-1">Logged in within 30 days</p>
          </CardContent>
        </Card>
        
        <Card className="glass-panel">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">People Tracked</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{peopleCount || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Customers & Suppliers</p>
          </CardContent>
        </Card>

        <Card className="glass-panel">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Custom Data</CardTitle>
            <LayoutList className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categoriesCount || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Categories ({budgetsCount || 0} Budgets)</p>
          </CardContent>
        </Card>

        <Card className="glass-panel">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
            <Activity className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{transactionsCount || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Global ledger entries</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="glass-panel">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Registered Users</CardTitle>
              <CardDescription>The latest accounts created on the platform.</CardDescription>
            </div>
            <Link href="/super-admin/users" className={buttonVariants({ variant: "ghost", size: "sm" })}>
              View All
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-6 animate-in fade-in duration-500">
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
                    <div className="ml-auto font-medium text-xs text-muted-foreground text-right space-y-1">
                      <div>{format(new Date(user.created_at), 'dd MMM yyyy')}</div>
                      <div className="text-[10px] text-emerald-500">
                        {user.last_sign_in_at ? 'Active recently' : 'Never logged in'}
                      </div>
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
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Global Recent Transactions</CardTitle>
              <CardDescription>The latest ledger activities across all users.</CardDescription>
            </div>
            <Link href="/super-admin/transactions" className={buttonVariants({ variant: "ghost", size: "sm" })}>
              View All
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-6 animate-in fade-in duration-500">
              {mappedRecentTransactions.length > 0 ? (
                mappedRecentTransactions.map((tx) => {
                  const isIncome = tx.type === 'INCOME';
                  const isExpense = tx.type === 'EXPENSE';
                  const isPositive = tx.type === 'RECEIVED' || tx.type === 'BORROWED' || isIncome;
                  
                  let icon = <ArrowLeftRight className="h-4 w-4" />;
                  if (isIncome) icon = <TrendingUp className="h-4 w-4" />;
                  else if (isExpense) icon = <TrendingDown className="h-4 w-4" />;
                  
                  return (
                    <div key={tx.id} className="flex items-center">
                      <div className={`p-2 rounded-full ${isPositive ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                        {icon}
                      </div>
                      <div className="ml-4 space-y-1">
                        <p className="text-sm font-medium leading-none">
                          <span className="font-semibold">{tx.userName}</span>
                          {tx.personName !== 'Unknown' && (
                            <span className="opacity-70 font-normal"> &rarr; {tx.personName}</span>
                          )}
                        </p>
                        <div className="flex items-center text-xs text-muted-foreground gap-2">
                          <Badge variant="outline" className="text-[10px] py-0">{tx.type}</Badge>
                          <span>{format(new Date(tx.transaction_date), 'MMM dd, yyyy')}</span>
                        </div>
                      </div>
                      <div className={`ml-auto font-medium ${isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
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
