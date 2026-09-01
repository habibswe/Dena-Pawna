import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MonthSelector } from '@/components/dashboard/month-selector';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { AddBudgetDialog } from '@/components/budgets/add-budget-dialog';
import { BudgetListClient } from '@/components/budgets/budget-list-client';
import { Suspense } from 'react';
import DashboardLoading from '@/components/ui/dashboard-loading';
import { getDictionary } from '@/i18n/server';

async function BudgetsContent({ month }: { month?: string }) {
  const supabase = await createClient();
  const t = await getDictionary();
  const currentMonth = month || format(new Date(), 'yyyy-MM');

  const [yearStr, monthStr] = currentMonth.split('-');
  const monthDate = new Date(parseInt(yearStr, 10), parseInt(monthStr, 10) - 1, 1);
  const startDate = format(startOfMonth(monthDate), 'yyyy-MM-dd');
  const endDate = format(endOfMonth(monthDate), 'yyyy-MM-dd');

  const [
    { data: categories },
    { data: budgets },
    { data: transactions }
  ] = await Promise.all([
    supabase.from('categories').select('*').eq('type', 'EXPENSE'),
    supabase.from('budgets').select('*').eq('month', currentMonth),
    supabase.from('transactions')
      .select('amount, category_id')
      .eq('type', 'EXPENSE')
      .gte('transaction_date', startDate)
      .lte('transaction_date', endDate)
  ]);

  const allCategories = categories || [];
  const allBudgets = budgets || [];
  const allTransactions = transactions || [];

  const categorySpent: Record<string, number> = {};
  allTransactions.forEach(tx => {
    if (tx.category_id) {
      categorySpent[tx.category_id] = (categorySpent[tx.category_id] || 0) + Number(tx.amount);
    }
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="flex items-start justify-between w-full sm:w-auto gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">{t.budgets.title}</h2>
            <p className="text-muted-foreground">{t.budgets.subtitle}</p>
          </div>
          <div className="sm:hidden mt-1 shrink-0">
            <MonthSelector currentMonth={currentMonth} />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="hidden sm:block">
            <MonthSelector currentMonth={currentMonth} />
          </div>
          <AddBudgetDialog categories={allCategories} defaultMonth={currentMonth} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <BudgetListClient 
          initialBudgets={allBudgets} 
          categories={allCategories} 
          categorySpent={categorySpent} 
        />
      </div>
    </div>
  );
}

export default async function BudgetsPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const { month } = await searchParams;
  
  return (
    <Suspense key={month || 'default'} fallback={<DashboardLoading />}>
      <BudgetsContent month={month} />
    </Suspense>
  );
}
