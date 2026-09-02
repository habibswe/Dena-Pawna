import { createClient } from '@/lib/supabase/server';
import { calculateBalance, calculateTimeframeSummary, calculateSummary, calculateTotalWalletBalance, Transaction } from '@/lib/calculations';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowDownLeft, ArrowUpRight, Wallet, ArrowRight, TrendingUp, TrendingDown, PiggyBank, Target, ArrowRightLeft } from 'lucide-react';
import Link from 'next/link';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { MonthSelector } from '@/components/dashboard/month-selector';
import { ExpenseBreakdown } from '@/components/dashboard/expense-breakdown';
import { Suspense } from 'react';
import DashboardLoading from '@/components/ui/dashboard-loading';
import { getDictionary } from '@/i18n/server';
import { ExpandableFab } from '@/components/ui/expandable-fab';

async function DashboardContent({ month, from, to }: { month?: string; from?: string; to?: string }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const t = await getDictionary();
  
  const isAllTime = month === 'all';
  const hasCustomRange = !!from || !!to;
  
  // If no params, default to current month
  const currentMonth = (!month && !hasCustomRange) ? format(new Date(), 'yyyy-MM') : month;

  const [
    { data: people }, 
    { data: transactions },
    { data: categories }
  ] = await Promise.all([
    supabase.from('people').select('id, name'),
    supabase.from('transactions').select('id, person_id, category_id, account_id, to_account_id, type, amount, transaction_date, note, due_date').order('transaction_date', { ascending: false }),
    supabase.from('categories').select('id, name')
  ]);

  const allTransactions = (transactions || []) as Transaction[];
  const allPeople = (people || []);
  const allCategories = (categories || []);

  const totalWalletBalance = calculateTotalWalletBalance(allTransactions);
  const timeframeSummary = calculateTimeframeSummary(allTransactions, currentMonth, from, to);

  // Overall People Balances (not tied to month)
  const peopleBalances = allPeople.map(person => {
    const personTxs = allTransactions.filter(tx => tx.person_id === person.id);
    return {
      ...person,
      balance: calculateBalance(personTxs, person)
    };
  });
  const { youAreOwed, youOwe, netBalance: totalNetBalance } = calculateSummary(peopleBalances.map(p => p.balance));
  const netWorth = totalWalletBalance + youAreOwed - youOwe;

  // Current timeframe's transactions for the list
  let currentFilteredTransactions = allTransactions;
  if (currentMonth && currentMonth !== 'all') {
    currentFilteredTransactions = allTransactions.filter(tx => tx.transaction_date.startsWith(currentMonth));
  } else if (from || to) {
    currentFilteredTransactions = allTransactions.filter(tx => {
      if (from && tx.transaction_date < from) return false;
      if (to && tx.transaction_date > to) return false;
      return true;
    });
  }
  
  const recentTransactions = currentFilteredTransactions.slice(0, 5);

  const expenseRate = timeframeSummary.income > 0 
    ? ((timeframeSummary.expense / timeframeSummary.income) * 100).toFixed(0) 
    : 0;

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="flex items-start justify-between w-full sm:w-auto gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">{t.dashboard.title}</h2>
            <p className="text-muted-foreground">{t.dashboard.subtitle}</p>
          </div>
          <div className="sm:hidden mt-1 shrink-0">
            <MonthSelector currentMonth={currentMonth} from={from} to={to} />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="hidden sm:block">
            <MonthSelector currentMonth={currentMonth} from={from} to={to} />
          </div>
          <Link href="/transactions/new" className={cn(buttonVariants(), 'hidden md:inline-flex')}>
            {t.dashboard.addTransaction}
          </Link>
        </div>
      </div>

      <ExpandableFab href="/transactions/new" label={t.dashboard.addTransaction} />

      {/* FINANCIAL HEALTH & LIQUIDITY SUMMARY */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
        {/* NET WORTH CARD */}
        <Card className="glass-panel border-primary/20 col-span-2 md:col-span-1 lg:col-span-1 bg-gradient-to-br from-primary/10 via-background/40 to-transparent">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.dashboard.netWorth}</CardTitle>
            <Wallet className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${netWorth >= 0 ? 'text-primary' : 'text-destructive'}`}>
              ৳{netWorth.toLocaleString()}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1 truncate">
              {t.dashboard.netWorthDesc}
            </p>
          </CardContent>
        </Card>

        {/* LIQUID CASH (MATCHES ACCOUNTS PAGE) */}
        <Card className="glass-panel border-emerald-500/20 col-span-2 md:col-span-1 lg:col-span-1 bg-gradient-to-br from-emerald-500/5 via-background/40 to-transparent">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.dashboard.liquidCash}</CardTitle>
            <PiggyBank className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              ৳{totalWalletBalance.toLocaleString()}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1 truncate">
              {t.dashboard.liquidCashDesc}
            </p>
          </CardContent>
        </Card>

        {/* MONTHLY CASH FLOW */}
        <Card className="glass-panel">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.dashboard.monthlyCashFlow}</CardTitle>
            <ArrowRightLeft className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${timeframeSummary.remaining >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-destructive'}`}>
              {timeframeSummary.remaining >= 0 ? '+' : '-'}৳{Math.abs(timeframeSummary.remaining).toLocaleString()}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1 truncate">
              {t.dashboard.monthlyCashFlowDesc}
            </p>
          </CardContent>
        </Card>

        {/* MONTHLY INCOME */}
        <Card className="glass-panel">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.dashboard.income}</CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-500">
              ৳{timeframeSummary.income.toLocaleString()}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              {recentTransactions.filter(t => t.type === 'INCOME').length} entries
            </p>
          </CardContent>
        </Card>

        {/* MONTHLY EXPENSES */}
        <Card className="glass-panel">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.dashboard.expenses}</CardTitle>
            <TrendingDown className="h-4 w-4 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-rose-500">
              ৳{timeframeSummary.expense.toLocaleString()}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">{expenseRate}% of income</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* EXPENSE BREAKDOWN */}
        <div className="lg:col-span-1">
          <ExpenseBreakdown transactions={currentFilteredTransactions} categories={allCategories} />
        </div>

        {/* MONEY FLOW */}
        <Card className="lg:col-span-2 glass-panel">
          <CardHeader>
            <CardTitle>{t.dashboard.moneyFlow} {currentMonth && currentMonth !== 'all' ? `(${format(new Date(currentMonth + '-01'), 'MMMM yyyy')})` : ''}</CardTitle>
            <CardDescription>Visual representation of your cash movement</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 animate-in fade-in duration-500">
             <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 ml-6">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="h-5 w-5 text-emerald-500" />
                    <span className="font-medium text-emerald-600 dark:text-emerald-400">{t.dashboard.income}</span>
                  </div>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">+৳{timeframeSummary.income.toLocaleString()}</span>
                </div>
                
                <div className="flex items-center justify-between p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 ml-6">
                  <div className="flex items-center gap-3">
                    <TrendingDown className="h-5 w-5 text-rose-500" />
                    <span className="font-medium text-rose-600 dark:text-rose-400">{t.dashboard.expenses}</span>
                  </div>
                  <span className="font-bold text-rose-600 dark:text-rose-400">-৳{timeframeSummary.expense.toLocaleString()}</span>
                </div>
                
                <div className="flex items-center justify-between p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 ml-6">
                  <div className="flex items-center gap-3">
                    <PiggyBank className="h-5 w-5 text-amber-500" />
                    <span className="font-medium text-amber-600 dark:text-amber-400">{t.dashboard.saved}</span>
                  </div>
                  <span className="font-bold text-amber-600 dark:text-amber-400">-৳{timeframeSummary.savings.toLocaleString()}</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 ml-6">
                  <div className="flex items-center gap-3">
                    <ArrowUpRight className="h-5 w-5 text-blue-500" />
                    <span className="font-medium text-blue-600 dark:text-blue-400">{t.dashboard.lent} ({t.dashboard.given} Out)</span>
                  </div>
                  <span className="font-bold text-blue-600 dark:text-blue-400">-৳{timeframeSummary.lent.toLocaleString()}</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-purple-500/10 border border-purple-500/20 ml-6">
                  <div className="flex items-center gap-3">
                    <ArrowDownLeft className="h-5 w-5 text-purple-500" />
                    <span className="font-medium text-purple-600 dark:text-purple-400">{t.dashboard.borrowed} (In)</span>
                  </div>
                  <span className="font-bold text-purple-600 dark:text-purple-400">+৳{timeframeSummary.borrowed.toLocaleString()}</span>
                </div>

                {timeframeSummary.repaymentsReceived > 0 && (
                  <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 ml-6">
                    <div className="flex items-center gap-3">
                      <TrendingUp className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                      <span className="font-medium text-emerald-600 dark:text-emerald-400">Loan Repayments Received (In)</span>
                    </div>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">+৳{timeframeSummary.repaymentsReceived.toLocaleString()}</span>
                  </div>
                )}

                {timeframeSummary.repaymentsSent > 0 && (
                  <div className="flex items-center justify-between p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/20 ml-6">
                    <div className="flex items-center gap-3">
                      <TrendingDown className="h-5 w-5 text-indigo-500" />
                      <span className="font-medium text-indigo-600 dark:text-indigo-400">Loan Repayments Made (Out)</span>
                    </div>
                    <span className="font-bold text-indigo-600 dark:text-indigo-400">-৳{timeframeSummary.repaymentsSent.toLocaleString()}</span>
                  </div>
                )}

                <div className="flex items-center justify-between p-4 rounded-xl bg-primary/10 border border-primary/20 mt-2">
                  <div className="flex items-center gap-3">
                    <Wallet className="h-6 w-6 text-primary" />
                    <span className="font-bold text-lg text-primary">{t.dashboard.monthlyRemaining}</span>
                  </div>
                  <span className="font-bold text-xl text-primary">৳{timeframeSummary.remaining.toLocaleString()}</span>
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
              <CardTitle>{t.dashboard.overallDebt}</CardTitle>
              <CardDescription>{t.dashboard.debtSubtitle}</CardDescription>
            </div>
            <Link href="/people" className={buttonVariants({ variant: "ghost", size: "sm" })}>
              {t.dashboard.viewAll} <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 mb-6">
               <div className="p-4 rounded-xl border bg-card/50">
                 <p className="text-sm text-muted-foreground mb-1">{t.dashboard.peopleOweYou}</p>
                 <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">৳{youAreOwed.toLocaleString()}</p>
               </div>
               <div className="p-4 rounded-xl border bg-card/50">
                 <p className="text-sm text-muted-foreground mb-1">{t.dashboard.youOweOthers}</p>
                 <p className="text-xl font-bold text-destructive">৳{youOwe.toLocaleString()}</p>
               </div>
            </div>
            <div className="space-y-4">
              {peopleBalances.filter(p => p.balance !== 0).slice(0, 4).map(person => {
                const isPositive = person.balance > 0;
                const color = isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-destructive';
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
                          {isPositive ? t.dashboard.owesYou : t.dashboard.youOwe}
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
              <CardTitle>{t.dashboard.recentTransactions}</CardTitle>
              <CardDescription>{t.dashboard.latestActivities}</CardDescription>
            </div>
            <Link href="/transactions" className={buttonVariants({ variant: "ghost", size: "sm" })}>
              {t.dashboard.viewAll} <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTransactions.length === 0 ? (
                <div className="text-center text-muted-foreground py-4">{t.dashboard.noTransactions}</div>
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
  searchParams: Promise<{ month?: string; from?: string; to?: string }>;
}) {
  const { month, from, to } = await searchParams;
  
  return (
    <Suspense key={`${month}-${from}-${to}`} fallback={<DashboardLoading />}>
      <DashboardContent month={month} from={from} to={to} />
    </Suspense>
  );
}
