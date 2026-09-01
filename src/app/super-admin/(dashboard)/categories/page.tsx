import { createAdminClient } from '@/lib/supabase/admin';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AdminSearch } from '@/components/admin/admin-search';
import { AdminPagination } from '@/components/admin/admin-pagination';
import { AdminFilterDropdown } from '@/components/admin/admin-filter-dropdown';
import { EditCategoryModal } from '@/components/admin/edit-category-modal';
import { DeleteButton } from '@/components/ui/delete-button';
import { deleteCategory } from '../actions';
import { format } from 'date-fns';
import * as Icons from 'lucide-react';

export default async function AdminCategoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string, page?: string, type?: string, budget?: string }>;
}) {
  const supabase = createAdminClient();
  const searchParamsResolved = await searchParams;
  const search = searchParamsResolved.search;
  const filterType = searchParamsResolved.type;
  const filterBudget = searchParamsResolved.budget;
  const page = parseInt(searchParamsResolved.page || '1');
  const PAGE_SIZE = 20;
  const offset = (page - 1) * PAGE_SIZE;

  let query = supabase.from('categories').select('*', { count: 'exact' }).order('created_at', { ascending: false });

  let matchingUserIds: string[] = [];
  if (search) {
    const { data: profileMatches } = await supabase.from('profiles').select('id').ilike('full_name', `%${search}%`);
    matchingUserIds = profileMatches?.map((p: any) => p.id) || [];
  }

  if (search) {
    let orQuery = `name.ilike.%${search}%`;
    if (matchingUserIds.length > 0) {
      orQuery += `,user_id.in.(${matchingUserIds.join(',')})`;
    }
    query = query.or(orQuery);
  }

  if (filterType && filterType !== 'ALL') {
    query = query.eq('type', filterType);
  }

  if (filterBudget && filterBudget !== 'ALL') {
    if (filterBudget === 'HAS_BUDGET') {
      query = query.eq('is_budget', true);
    } else if (filterBudget === 'NO_BUDGET') {
      query = query.eq('is_budget', false);
    }
  }

  query = query.range(offset, offset + PAGE_SIZE - 1);

  const { data: rawCategories, count } = await query;
  
  // Manually fetch profiles since there is no direct foreign key
  let categories = rawCategories || [];
  if (categories.length > 0) {
    const userIds = [...new Set(categories.map((c: any) => c.user_id).filter(Boolean))];
    if (userIds.length > 0) {
      const { data: profiles } = await supabase.from('profiles').select('id, full_name').in('id', userIds);
      const profileMap = new Map((profiles || []).map((p: any) => [p.id, p]));
      categories = categories.map((c: any) => ({
        ...c,
        profiles: profileMap.get(c.user_id) || null
      }));
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Manage Categories</h2>
        <p className="text-muted-foreground">View and manage all transaction categories across the platform.</p>
      </div>

      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <AdminSearch placeholder="Search by name or type..." />
          <AdminFilterDropdown 
            paramName="type"
            placeholder="Types"
            options={[
              { label: 'Income', value: 'INCOME' },
              { label: 'Expense', value: 'EXPENSE' },
              { label: 'Transfer', value: 'TRANSFER' },
            ]}
          />
          <AdminFilterDropdown 
            paramName="budget"
            placeholder="Budget Status"
            options={[
              { label: 'Has Budget Limit', value: 'HAS_BUDGET' },
              { label: 'No Budget Limit', value: 'NO_BUDGET' },
            ]}
          />
        </div>
      </div>

      <Card className="glass-panel">
        <CardHeader>
          <CardTitle>All Categories</CardTitle>
          <CardDescription>A complete list of categories in the system.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="relative overflow-x-auto border-y">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase bg-muted/50 border-b">
                <tr>
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Budget</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories?.map((category) => {
                  const Icon = (Icons as any)[category.icon] || Icons.HelpCircle;
                  return (
                    <tr key={category.id} className="border-b border-border/50 last:border-0 hover:bg-secondary/20">
                      <td className="px-6 py-4 font-mono text-xs text-muted-foreground">{category.id.substring(0, 8)}...</td>
                      <td className="px-6 py-4 font-medium">{category.profiles?.full_name || 'Unknown User'}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 font-bold">
                          <Icon className="w-4 h-4 text-primary" />
                          {category.name}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center rounded-full bg-secondary px-2.5 py-0.5 text-xs font-semibold">
                          {category.type}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {category.is_budget ? (
                           <span className="text-primary font-medium">৳{category.budget_limit?.toLocaleString() || 0}</span>
                        ) : (
                           <span className="text-muted-foreground text-xs">No Budget</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <EditCategoryModal category={category} />
                          <DeleteButton 
                            onDelete={async () => {
                              'use server';
                              return await deleteCategory(category.id);
                            }} 
                            itemType="Category" 
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {(!categories || categories.length === 0) && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                      No categories found matching your criteria.
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
