import { createClient } from '@/lib/supabase/server';
import { calculateSummary, calculateMonthlySummary, calculateBalance, Transaction } from '@/lib/calculations';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowDownLeft, ArrowUpRight, Wallet, ArrowRight, TrendingUp, TrendingDown, PiggyBank, Target, ArrowRightLeft } from 'lucide-react';
import Link from 'next/link';
import { Button, buttonVariants } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { MonthSelector } from '@/components/dashboard/month-selector';
import { ExpenseBreakdown } from '@/components/dashboard/expense-breakdown';
import { Suspense } from 'react';
import DashboardLoading from '@/components/ui/dashboard-loading';

async function DashboardContent({ month }: { month?: string }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const currentMonth = month || format(new Date(), 'yyyy-MM');

  const [
    { data: people }, 
    { data: transactions },
    { data: categories }
  ] = await Promise.all([
    supabase.from('people').select('*'),
    supabase.from('transactions').select('*').order('transaction_date', { ascending: false }),
    supabase.from('categories').select('*')
  ]);

  const allTransactions = (transactions || []) as Transaction[];
  const allPeople = (people || []);
  const allCategories = (categories || []);

  const monthlySummary = calculateMonthlySummary(allTransactions, currentMonth);

  // Overall People Balances (not tied to month)
  const peopleBalances = allPeople.map(person => {
    const personTxs = allTransactions.filter(tx => tx.person_id === person.id);
    return {
      ...person,
      balance: calculateBalance(personTxs)
    };
  });
  const { youAreOwed, youOwe, netBalance: totalNetBalance } = calculateSummary(peopleBalances.map(p => p.balance));

  // Current month's transactions
  const currentMonthTransactions = allTransactions.filter(tx => tx.transaction_date.startsWith(currentMonth));
  const recentTransactions = allTransactions.slice(0, 5);

  const expenseRate = monthlySummary.income > 0 
    ? ((monthlySummary.expense / monthlySummary.income) * 100).toFixed(0) 
    : 0;

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Overview</h2>
          <p className="text-muted-foreground">Your financial health at a glance.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <MonthSelector currentMonth={currentMonth} />
          <Link href="/transactions/new" className={buttonVariants()}>
            + Add Transaction
          </Link>
        </div>
      </div>

      {/* MONTHLY FINANCIAL SUMMARY */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4 lg:grid-cols-5">
        <Card className="glass-panel border-primary/20 col-span-2 md:col-span-2 lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available (Month)</CardTitle>
            <Wallet className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${monthlySummary.remaining >= 0 ? 'text-primary' : 'text-destructive'}`}>
              {monthlySummary.remaining >= 0 ? '' : '-'}৳{Math.abs(monthlySummary.remaining).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Income - Exp - Saved</p>
          </CardContent>
        </Card>
        <Card className="glass-panel">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Income</CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-500">
              ৳{monthlySummary.income.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card className="glass-panel">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expenses</CardTitle>
            <TrendingDown className="h-4 w-4 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-rose-500">
              ৳{monthlySummary.expense.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">{expenseRate}% of income</p>
          </CardContent>
        </Card>
        <Card className="glass-panel">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saved</CardTitle>
            <PiggyBank className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-500">
              ৳{monthlySummary.savings.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card className="glass-panel">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lent</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">
              ৳{monthlySummary.lent.toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* EXPENSE BREAKDOWN */}
        <div className="lg:col-span-1">
          <ExpenseBreakdown transactions={currentMonthTransactions} categories={allCategories} />
        </div>

        {/* MONEY FLOW */}
        <Card className="lg:col-span-2 glass-panel">
          <CardHeader>
            <CardTitle>Money Flow ({format(new Date(currentMonth + '-01'), 'MMMM yyyy')})</CardTitle>
            <CardDescription>Visual representation of your cash movement</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
             <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="h-5 w-5 text-emerald-500" />
                    <span className="font-medium text-emerald-600 dark:text-emerald-400">Total Income</span>
                  </div>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">+৳{monthlySummary.income.toLocaleString()}</span>
                </div>
                
                <div className="flex items-center justify-between p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 ml-6">
                  <div className="flex items-center gap-3">
                    <TrendingDown className="h-5 w-5 text-rose-500" />
                    <span className="font-medium text-rose-600 dark:text-rose-400">Expenses</span>
                  </div>
                  <span className="font-bold text-rose-600 dark:text-rose-400">-৳{monthlySummary.expense.toLocaleString()}</span>
                </div>
                
                <div className="flex items-center justify-between p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 ml-6">
                  <div className="flex items-center gap-3">
                    <PiggyBank className="h-5 w-5 text-amber-500" />
                    <span className="font-medium text-amber-600 dark:text-amber-400">Savings</span>
                  </div>
                  <span className="font-bold text-amber-600 dark:text-amber-400">-৳{monthlySummary.savings.toLocaleString()}</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 ml-6">
                  <div className="flex items-center gap-3">
                    <ArrowUpRight className="h-5 w-5 text-blue-500" />
                    <span className="font-medium text-blue-600 dark:text-blue-400">Lent (Given Out)</span>
                  </div>
                  <span className="font-bold text-blue-600 dark:text-blue-400">-৳{monthlySummary.lent.toLocaleString()}</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-purple-500/10 border border-purple-500/20 ml-6">
                  <div className="flex items-center gap-3">
                    <ArrowDownLeft className="h-5 w-5 text-purple-500" />
                    <span className="font-medium text-purple-600 dark:text-purple-400">Borrowed (In)</span>
                  </div>
                  <span className="font-bold text-purple-600 dark:text-purple-400">+৳{monthlySummary.borrowed.toLocaleString()}</span>
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-primary/10 border border-primary/20 mt-2">
                  <div className="flex items-center gap-3">
                    <Wallet className="h-6 w-6 text-primary" />
                    <span className="font-bold text-lg text-primary">Monthly Remaining</span>
                  </div>
                  <span className="font-bold text-xl text-primary">৳{monthlySummary.remaining.toLocaleString()}</span>
                </div>
             </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* PEOPLE SUMMARY */}
        <Card className="glass-panel">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Overall Debt Summary</CardTitle>
              <CardDescription>Total outstanding balances across all time</CardDescription>
            </div>
            <Link href="/people" className={buttonVariants({ variant: "ghost", size: "sm" })}>
              View All <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 mb-6">
               <div className="p-4 rounded-xl border bg-card/50">
                 <p className="text-sm text-muted-foreground mb-1">People Owe You</p>
                 <p className="text-xl font-bold text-primary">৳{youAreOwed.toLocaleString()}</p>
               </div>
               <div className="p-4 rounded-xl border bg-card/50">
                 <p className="text-sm text-muted-foreground mb-1">You Owe Others</p>
                 <p className="text-xl font-bold text-destructive">৳{youOwe.toLocaleString()}</p>
               </div>
            </div>
            <div className="space-y-4">
              {peopleBalances.filter(p => p.balance !== 0).slice(0, 4).map(person => {
                const isPositive = person.balance > 0;
                const color = isPositive ? 'text-primary' : 'text-destructive';
                return (
                  <div key={person.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9 border border-primary/20">
                        <AvatarFallback className="bg-primary/5 text-primary">
                          {person.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">{person.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {isPositive ? 'Owes you' : 'You owe'}
                        </p>
                      </div>
                    </div>
                    <div className={`font-medium ${color}`}>
                      {isPositive ? '+' : '-'}৳{Math.abs(person.balance).toLocaleString()}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* RECENT TRANSACTIONS */}
        <Card className="glass-panel">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>Your latest financial activities</CardDescription>
            </div>
            <Link href="/transactions" className={buttonVariants({ variant: "ghost", size: "sm" })}>
              View All <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTransactions.length === 0 ? (
                <div className="text-center text-muted-foreground py-4">No transactions yet.</div>
              ) : (
                recentTransactions.map(tx => {
                  const person = allPeople.find(p => p.id === tx.person_id);
                  const category = allCategories.find(c => c.id === tx.category_id);
                  
                  // Determine display properties
                  let title = tx.type as string;
                  let subtitle = '';
                  let amountColor = 'text-foreground';
                  let sign = '';
                  
                  if (tx.type === 'INCOME') {
                    title = category?.name || 'Income';
                    amountColor = 'text-emerald-500';
                    sign = '+';
                  } else if (tx.type === 'EXPENSE') {
                    title = category?.name || 'Expense';
                    amountColor = 'text-foreground';
                    sign = '-';
                  } else if (tx.type === 'TRANSFER') {
                    title = 'Transfer';
                    amountColor = 'text-muted-foreground';
                  } else if (tx.type === 'SAVING') {
                    title = 'Saving';
                    amountColor = 'text-amber-500';
                    sign = '-';
                  } else if (['GIVEN', 'RETURNED'].includes(tx.type)) {
                    title = person?.name || 'Lending';
                    subtitle = tx.type === 'GIVEN' ? 'You gave' : 'You returned';
                    amountColor = 'text-blue-500';
                    sign = '-';
                  } else if (['RECEIVED', 'BORROWED'].includes(tx.type)) {
                    title = person?.name || 'Borrowing';
                    subtitle = tx.type === 'RECEIVED' ? 'You received' : 'You borrowed';
                    amountColor = 'text-purple-500';
                    sign = '+';
                  }

                  return (
                    <div key={tx.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3 min-w-0 pr-4">
                        <div className="h-9 w-9 rounded-full bg-secondary flex items-center justify-center shrink-0">
                          <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="space-y-1 min-w-0">
                          <p className="text-sm font-medium leading-none truncate">{title}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {subtitle ? `${subtitle} • ` : ''}{format(new Date(tx.transaction_date), 'dd MMM yyyy')}
                          </p>
                        </div>
                      </div>
                      <div className={`font-medium ${amountColor}`}>
                        {sign}৳{Number(tx.amount).toLocaleString()}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const { month } = await searchParams;
  
  return (
    <Suspense key={month || 'default'} fallback={<DashboardLoading />}>
      <DashboardContent month={month} />
    </Suspense>
  );
}
