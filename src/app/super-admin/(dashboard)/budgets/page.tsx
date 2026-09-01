import { createAdminClient } from '@/lib/supabase/admin';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AdminSearch } from '@/components/admin/admin-search';
import { AdminPagination } from '@/components/admin/admin-pagination';
import { AdminFilterDropdown } from '@/components/admin/admin-filter-dropdown';
import { EditBudgetModal } from '@/components/admin/edit-budget-modal';
import { DeleteButton } from '@/components/ui/delete-button';
import { deleteBudget } from '../actions';
import { format } from 'date-fns';

export default async function AdminBudgetsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string, page?: string, type?: string }>;
}) {
  const supabase = createAdminClient();
  const searchParamsResolved = await searchParams;
  const search = searchParamsResolved.search;
  const filterType = searchParamsResolved.type;
  const page = parseInt(searchParamsResolved.page || '1');
  const PAGE_SIZE = 20;
  const offset = (page - 1) * PAGE_SIZE;

  let query = supabase.from('budgets').select('*, categories!inner(name, type)', { count: 'exact' }).order('month', { ascending: false });

  let matchingUserIds: string[] = [];
  if (search) {
    const { data: profileMatches } = await supabase.from('profiles').select('id').ilike('full_name', `%${search}%`);
    matchingUserIds = profileMatches?.map((p: any) => p.id) || [];
  }

  if (search) {
    let orQuery = `month.ilike.%${search}%`;
    if (matchingUserIds.length > 0) {
      orQuery += `,user_id.in.(${matchingUserIds.join(',')})`;
    }
    query = query.or(orQuery);
  }

  if (filterType && filterType !== 'ALL') {
    query = query.eq('categories.type', filterType);
  }

  query = query.range(offset, offset + PAGE_SIZE - 1);

  const { data: rawBudgets, count } = await query;
  
  // Manually fetch profiles since there is no direct foreign key
  let budgets = rawBudgets || [];
  if (budgets.length > 0) {
    const userIds = [...new Set(budgets.map((b: any) => b.user_id).filter(Boolean))];
    if (userIds.length > 0) {
      const { data: profiles } = await supabase.from('profiles').select('id, full_name').in('id', userIds);
      const profileMap = new Map((profiles || []).map((p: any) => [p.id, p]));
      budgets = budgets.map((b: any) => ({
        ...b,
        profiles: profileMap.get(b.user_id) || null
      }));
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Manage Budgets</h2>
        <p className="text-muted-foreground">View and manage all user budgets across the platform.</p>
      </div>

      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <AdminSearch placeholder="Search by month (YYYY-MM)..." />
          <AdminFilterDropdown 
            paramName="type"
            placeholder="Category Type"
            options={[
              { label: 'Income', value: 'INCOME' },
              { label: 'Expense', value: 'EXPENSE' },
              { label: 'Transfer', value: 'TRANSFER' },
            ]}
          />
        </div>
      </div>

      <Card className="glass-panel">
        <CardHeader>
          <CardTitle>All Budgets</CardTitle>
          <CardDescription>A complete list of monthly budgets set by users.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="relative overflow-x-auto border-y">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase bg-muted/50 border-b">
                <tr>
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">Month</th>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {budgets?.map((budget) => (
                  <tr key={budget.id} className="border-b border-border/50 last:border-0 hover:bg-secondary/20">
                    <td className="px-6 py-4 font-mono text-xs text-muted-foreground">{budget.id.substring(0, 8)}...</td>
                    <td className="px-6 py-4 font-bold">{budget.month}</td>
                    <td className="px-6 py-4 font-medium">{budget.profiles?.full_name || 'Unknown User'}</td>
                    <td className="px-6 py-4">{budget.categories?.name || 'Unknown Category'}</td>
                    <td className="px-6 py-4 text-primary font-bold">
                      ৳{budget.amount?.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <EditBudgetModal budget={budget} />
                        <DeleteButton 
                          onDelete={async () => {
                            'use server';
                            return await deleteBudget(budget.id);
                          }} 
                          itemType="Budget" 
                        />
                      </div>
                    </td>
                  </tr>
                ))}
                {(!budgets || budgets.length === 0) && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                      No budgets found matching your criteria.
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
