import { createClient } from '@/lib/supabase/server';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { Button, buttonVariants } from '@/components/ui/button';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { MonthSelector } from '@/components/dashboard/month-selector';
import { ExportButtons } from '@/components/ui/export-buttons';
import { TransactionListClient } from '@/components/transactions/transaction-list-client';
import { TransactionFilterDropdown } from '@/components/transactions/transaction-filter-dropdown';
import { TransactionSearch } from '@/components/transactions/transaction-search';
import { Suspense } from 'react';
import DashboardLoading from '@/components/ui/dashboard-loading';
import { ExpandableFab } from '@/components/ui/expandable-fab';
import { getDictionary } from '@/i18n/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function TransactionsContent({ searchParamsResolved }: { searchParamsResolved: { filter?: string, month?: string, search?: string } }) {
  const supabase = await createClient();
  const t = await getDictionary();

  const filter = searchParamsResolved.filter;
  const month = searchParamsResolved.month;
  const currentMonth = month || format(new Date(), 'yyyy-MM');
  const search = searchParamsResolved.search;

  let query = supabase.from('transactions').select('*', { count: 'exact' }).order('transaction_date', { ascending: false }).order('created_at', { ascending: false });

  if (filter && filter !== 'ALL') {
    query = query.eq('type', filter);
  }

  if (search) {
    query = query.or(`note.ilike.%${search}%,type.ilike.%${search}%`);
  }

  const [yearStr, monthStr] = currentMonth.split('-');
  const monthDate = new Date(parseInt(yearStr, 10), parseInt(monthStr, 10) - 1, 1);
  const startDate = format(startOfMonth(monthDate), 'yyyy-MM-dd');
  const endDate = format(endOfMonth(monthDate), 'yyyy-MM-dd') + 'T23:59:59.999Z';

  query = query.gte('transaction_date', startDate).lte('transaction_date', endDate);

  query = query.range(0, 19);

  const [
    { data: transactionsData, count, error: txError },
    { data: peopleData },
    { data: categoriesData },
    { data: accountsData }
  ] = await Promise.all([
    query,
    supabase.from('people').select('*'),
    supabase.from('categories').select('*'),
    supabase.from('accounts').select('*')
  ]);

  if (txError) {
    console.error("Error fetching transactions:", txError);
  }

  const peopleMap = new Map((peopleData || []).map(p => [p.id, p]));
  const categoriesMap = new Map((categoriesData || []).map(c => [c.id, c]));
  const accountsMap = new Map((accountsData || []).map(a => [a.id, a]));

  const transactions = (transactionsData || []).map(tx => ({
    ...tx,
    people: tx.person_id ? peopleMap.get(tx.person_id) : null,
    categories: tx.category_id ? categoriesMap.get(tx.category_id) : null,
    accounts: tx.account_id ? accountsMap.get(tx.account_id) : null,
  }));
  const people = peopleData || [];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-4">
        <div className="flex items-start justify-between w-full xl:w-auto gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">{t.transactions.title}</h2>
            <p className="text-muted-foreground">{t.transactions.subtitle}</p>
          </div>
          <div className="sm:hidden mt-1 shrink-0">
            <MonthSelector currentMonth={currentMonth} />
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 w-full xl:w-auto">
          <div className="hidden sm:block">
            <MonthSelector currentMonth={currentMonth} />
          </div>
          <div className="flex flex-row items-center justify-between sm:justify-start gap-3 sm:border-l sm:border-border sm:pl-4 w-full sm:w-auto">
            <TransactionFilterDropdown currentFilter={filter} />
            <ExportButtons transactions={transactions} people={people} />
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1 w-full">
          <TransactionSearch placeholder={t.transactions.searchPlaceholder} />
        </div>
        <div className="hidden md:block">
          <Link href="/transactions/new" className={buttonVariants({ className: "whitespace-nowrap gap-2" })}>
            <Plus className="h-4 w-4" /> {t.transactions.addNew}
          </Link>
        </div>
      </div>

      <ExpandableFab href="/transactions/new" label={t.transactions.addNew} />

      <Card className="glass-panel">
        <CardContent className="p-0">
          {transactions && transactions.length > 0 && (
            <div className="hidden sm:flex px-6 py-3 bg-muted/20 text-xs font-semibold uppercase tracking-wider text-muted-foreground border-b border-border items-center">
              <div className="w-[40%] pl-14">{t.transactions.nameAndDate}</div>
              <div className="flex-1 text-left">{t.transactions.note}</div>
              <div className="w-[120px] text-right">{t.transactions.amount}</div>
            </div>
          )}
          <TransactionListClient 
            initialTransactions={transactions} 
            totalCount={count || 0}
            filter={filter}
            month={currentMonth}
            search={search}
          />
        </CardContent>
      </Card>
    </div>
  );
}

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string, month?: string, search?: string }>;
}) {
  const searchParamsResolved = await searchParams;
  const suspenseKey = JSON.stringify(searchParamsResolved);
  
  return (
    <Suspense key={suspenseKey} fallback={<DashboardLoading />}>
      <TransactionsContent searchParamsResolved={searchParamsResolved} />
    </Suspense>
  );
}
