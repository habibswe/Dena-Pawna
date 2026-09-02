import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MonthSelector } from '@/components/dashboard/month-selector';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { AddBudgetDialog } from '@/components/budgets/add-budget-dialog';
import { BudgetListClient } from '@/components/budgets/budget-list-client';
import { Suspense } from 'react';
import { SkeletonHeader, SkeletonCards } from '@/components/ui/skeletons';
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
    { data: defaultBudgets },
    { data: transactions }
  ] = await Promise.all([
    supabase.from('categories').select('*').eq('type', 'EXPENSE'),
    supabase.from('budgets').select('*').eq('month', currentMonth),
    supabase.from('budgets').select('*').eq('is_default', true),
    supabase.from('transactions')
      .select('amount, category_id')
      .eq('type', 'EXPENSE')
      .gte('transaction_date', startDate)
      .lte('transaction_date', endDate)
  ]);

  let allBudgets = budgets || [];
  const existingCategoryIds = new Set(allBudgets.map(b => b.category_id));

  // Find unique default budgets for categories not yet in this month
  const uniqueDefaults = new Map<string, any>();
  (defaultBudgets || []).forEach(b => {
    if (!existingCategoryIds.has(b.category_id) && !uniqueDefaults.has(b.category_id)) {
      uniqueDefaults.set(b.category_id, b);
    }
  });

  if (uniqueDefaults.size > 0) {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const toInsert = Array.from(uniqueDefaults.values()).map(b => ({
        user_id: user.id,
        category_id: b.category_id,
        amount: b.amount,
        month: currentMonth,
        is_default: true
      }));

      const { data: inserted } = await supabase
        .from('budgets')
        .insert(toInsert)
        .select();

      if (inserted && inserted.length > 0) {
        allBudgets = [...allBudgets, ...inserted];
      }
    }
  }

  const allCategories = categories || [];
  const allTransactions = transactions || [];

  const categorySpent: Record<string, number> = {};
  allTransactions.forEach(tx => {
    if (tx.category_id) {
      categorySpent[tx.category_id] = (categorySpent[tx.category_id] || 0) + Number(tx.amount);
    }
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start justify-between w-full sm:w-auto gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">{t.budgets.title}</h2>
            <p className="text-muted-foreground">{t.budgets.subtitle}</p>
          </div>
          <div className="sm:hidden mt-1 shrink-0">
            <MonthSelector currentMonth={currentMonth} />
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-3 shrink-0">
          <MonthSelector currentMonth={currentMonth} />
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
    <Suspense 
      key={month || 'default'} 
      fallback={
        <div className="space-y-6 w-full">
          <SkeletonHeader title subtitle button={true} />
          <SkeletonCards count={6} />
        </div>
      }
    >
      <BudgetsContent month={month} />
    </Suspense>
  );
}
