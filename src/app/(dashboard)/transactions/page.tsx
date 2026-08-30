import { createClient } from '@/lib/supabase/server';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { Button, buttonVariants } from '@/components/ui/button';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { MonthSelector } from '@/components/dashboard/month-selector';
import { ExportButtons } from '@/components/ui/export-buttons';
import { TransactionListClient } from '@/components/transactions/transaction-list-client';
import { TransactionSearch } from '@/components/transactions/transaction-search';
import { Suspense } from 'react';
import DashboardLoading from '@/components/ui/dashboard-loading';
import { ExpandableFab } from '@/components/ui/expandable-fab';

async function TransactionsContent({ searchParamsResolved }: { searchParamsResolved: { filter?: string, month?: string, search?: string } }) {
  const supabase = await createClient();

  const filter = searchParamsResolved.filter;
  const month = searchParamsResolved.month;
  const currentMonth = month || format(new Date(), 'yyyy-MM');
  const search = searchParamsResolved.search;

  let query = supabase.from('transactions').select('*, people!inner(name)', { count: 'exact' }).order('transaction_date', { ascending: false });

  if (filter && filter !== 'ALL') {
    query = query.eq('type', filter);
  }

  if (search) {
    query = query.or(`people.name.ilike.%${search}%,note.ilike.%${search}%,type.ilike.%${search}%`);
  }

  query = query.gte('transaction_date', `${currentMonth}-01`).lte('transaction_date', `${currentMonth}-31`);

  query = query.range(0, 19);

  const [{ data: transactionsData, count }, { data: peopleData }] = await Promise.all([
    query,
    supabase.from('people').select('*')
  ]);

  const transactions = transactionsData || [];
  const people = peopleData || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Transactions</h2>
          <p className="text-muted-foreground">Your complete financial history.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 w-full xl:w-auto">
          <MonthSelector currentMonth={currentMonth} />
          <div className="flex flex-row items-center justify-between sm:justify-start gap-3 sm:border-l sm:border-border sm:pl-4 w-full sm:w-auto">
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide">
              <Link href={`/transactions?filter=ALL${month ? `&month=${month}` : ''}`} className={buttonVariants({ variant: filter === 'ALL' || !filter ? 'default' : 'outline', size: "sm", className: "whitespace-nowrap" })}>
                All
              </Link>
              <Link href={`/transactions?filter=GIVEN${month ? `&month=${month}` : ''}`} className={buttonVariants({ variant: filter === 'GIVEN' ? 'default' : 'outline', size: "sm", className: "whitespace-nowrap" })}>
                Given
              </Link>
              <Link href={`/transactions?filter=RECEIVED${month ? `&month=${month}` : ''}`} className={buttonVariants({ variant: filter === 'RECEIVED' ? 'default' : 'outline', size: "sm", className: "whitespace-nowrap" })}>
                Received
              </Link>
            </div>
            <ExportButtons transactions={transactions} people={people} />
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1 w-full">
          <TransactionSearch placeholder="Search name, note..." />
        </div>
        <Link href="/transactions/new" className={buttonVariants({ size: "sm", className: "hidden md:inline-flex whitespace-nowrap" })}>
          <Plus className="mr-2 h-4 w-4" /> Add New
        </Link>
      </div>

      <ExpandableFab href="/transactions/new" label="Add Transaction" />

      <Card className="glass-panel">
        <CardContent className="p-0">
          {transactions && transactions.length > 0 && (
            <div className="hidden sm:flex px-6 py-3 bg-muted/20 text-xs font-semibold uppercase tracking-wider text-muted-foreground border-b border-border items-center">
              <div className="w-[40%] pl-14">Name & Date</div>
              <div className="flex-1 text-left">Note</div>
              <div className="w-[120px] text-right">Amount</div>
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
