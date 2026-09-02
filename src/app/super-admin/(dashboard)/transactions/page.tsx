import { createAdminClient } from '@/lib/supabase/admin';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { deleteTransaction } from '../actions';
import { format } from 'date-fns';
import { AdminSearch } from '@/components/admin/admin-search';
import { AdminDateFilter } from '@/components/admin/admin-date-filter';
import { AdminPagination } from '@/components/admin/admin-pagination';
import { AdminFilterDropdown } from '@/components/admin/admin-filter-dropdown';
import { EditTransactionModal } from '@/components/admin/edit-transaction-modal';
import { DeleteButton } from '@/components/ui/delete-button';

export default async function AdminTransactionsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string, from?: string, to?: string, page?: string, type?: string }>;
}) {
  const supabase = createAdminClient();
  const searchParamsResolved = await searchParams;
  const search = searchParamsResolved.search;
  const from = searchParamsResolved.from;
  const to = searchParamsResolved.to;
  const filterType = searchParamsResolved.type;
  const page = parseInt(searchParamsResolved.page || '1');
  const PAGE_SIZE = 20;
  const offset = (page - 1) * PAGE_SIZE;

  let query = supabase.from('transactions').select('*, people(name), categories(name), accounts!transactions_account_id_fkey(name)', { count: 'exact' }).order('transaction_date', { ascending: false });

  let matchingUserIds: string[] = [];
  if (search) {
    const { data: profileMatches } = await supabase.from('profiles').select('id').ilike('full_name', `%${search}%`);
    matchingUserIds = profileMatches?.map((p: any) => p.id) || [];
  }

  if (search) {
    let orQuery = `note.ilike.%${search}%`;
    if (matchingUserIds.length > 0) {
      orQuery += `,user_id.in.(${matchingUserIds.join(',')})`;
    }
    query = query.or(orQuery);
  }

  if (filterType && filterType !== 'ALL') {
    query = query.eq('type', filterType);
  }

  if (from && to) {
    query = query.gte('transaction_date', new Date(from).toISOString()).lte('transaction_date', new Date(`${to}T23:59:59.999Z`).toISOString());
  } else if (from) {
    query = query.gte('transaction_date', new Date(from).toISOString());
  } else if (to) {
    query = query.lte('transaction_date', new Date(`${to}T23:59:59.999Z`).toISOString());
  }

  query = query.range(offset, offset + PAGE_SIZE - 1);

  const { data: rawTransactions, count } = await query;

  // Manually fetch profiles since there is no direct foreign key
  let transactions = rawTransactions || [];
  if (transactions.length > 0) {
    const userIdsToFetch = [...new Set(transactions.map((t: any) => t.user_id).filter(Boolean))];
    if (userIdsToFetch.length > 0) {
      const { data: profiles } = await supabase.from('profiles').select('id, full_name').in('id', userIdsToFetch);
      const profileMap = new Map((profiles || []).map((p: any) => [p.id, p]));
      transactions = transactions.map((t: any) => ({
        ...t,
        profiles: profileMap.get(t.user_id) || null
      }));
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Manage Transactions</h2>
        <p className="text-muted-foreground">View and manage all transactions logged across the platform.</p>
      </div>

      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <AdminSearch placeholder="Search by type, or note..." />
          <AdminFilterDropdown 
            paramName="type"
            placeholder="Types"
            options={[
              { label: 'Given', value: 'GIVEN' },
              { label: 'Received', value: 'RECEIVED' },
              { label: 'Borrowed', value: 'BORROWED' },
              { label: 'Returned', value: 'RETURNED' },
              { label: 'Income', value: 'INCOME' },
              { label: 'Expense', value: 'EXPENSE' },
              { label: 'Transfer', value: 'TRANSFER' },
            ]}
          />
        </div>
        <AdminDateFilter />
      </div>

      <Card className="glass-panel">
        <CardHeader>
          <CardTitle>All Transactions</CardTitle>
          <CardDescription>A complete list of transactions in the system.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="relative overflow-x-auto border-y">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase bg-muted/50 border-b">
                <tr>
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Entity</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {transactions?.map((tx) => {
                  const isCashInflow = ['INCOME', 'BORROWED', 'RECEIVED'].includes(tx.type);
                  const isTransfer = tx.type === 'TRANSFER';
                  const colorClass = isTransfer 
                    ? 'text-muted-foreground' 
                    : isCashInflow 
                      ? 'text-emerald-600 dark:text-emerald-400' 
                      : 'text-destructive';
                  const sign = isTransfer ? '' : isCashInflow ? '+' : '-';

                  return (
                    <tr key={tx.id} className="border-b border-border/50 last:border-0 hover:bg-secondary/20">
                      <td className="px-6 py-4 font-mono text-xs text-muted-foreground">{tx.id.substring(0, 8)}...</td>
                      <td className="px-6 py-4">
                        {tx.transaction_date ? format(new Date(tx.transaction_date), 'dd MMM yyyy') : 'Unknown'}
                      </td>
                      <td className="px-6 py-4 font-medium">{tx.profiles?.full_name || 'Unknown User'}</td>
                      <td className="px-6 py-4">{tx.people?.name || tx.categories?.name || tx.accounts?.name || 'General'}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center rounded-full bg-secondary px-2.5 py-0.5 text-xs font-semibold">
                          {tx.type}
                        </span>
                      </td>
                      <td className={`px-6 py-4 font-bold ${colorClass}`}>
                        {sign}৳{Number(tx.amount).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <EditTransactionModal transaction={tx} />
                          <DeleteButton 
                            onDelete={async () => {
                              'use server';
                              return await deleteTransaction(tx.id);
                            }} 
                            itemType="Transaction" 
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {(!transactions || transactions.length === 0) && (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
                      No transactions found matching your criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <AdminPagination totalCount={count || 0} pageSize={PAGE_SIZE} />
        </CardContent>
      </Card>
    </div>
  );
}
