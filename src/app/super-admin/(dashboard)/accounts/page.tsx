import { createAdminClient } from '@/lib/supabase/admin';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AdminSearch } from '@/components/admin/admin-search';
import { AdminPagination } from '@/components/admin/admin-pagination';
import { AdminFilterDropdown } from '@/components/admin/admin-filter-dropdown';
import { EditAccountModal } from '@/components/admin/edit-account-modal';
import { DeleteButton } from '@/components/ui/delete-button';
import { deleteAccount } from '../actions';
import { format } from 'date-fns';

export default async function AdminAccountsPage({
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

  let query = supabase.from('accounts').select('*', { count: 'exact' }).order('created_at', { ascending: false });

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

  query = query.range(offset, offset + PAGE_SIZE - 1);

  const { data: rawAccounts, count } = await query;
  
  // Manually fetch profiles since there is no direct foreign key
  let accounts = rawAccounts || [];
  if (accounts.length > 0) {
    const userIds = [...new Set(accounts.map((a: any) => a.user_id).filter(Boolean))];
    if (userIds.length > 0) {
      const { data: profiles } = await supabase.from('profiles').select('id, full_name').in('id', userIds);
      const profileMap = new Map((profiles || []).map((p: any) => [p.id, p]));
      accounts = accounts.map((a: any) => ({
        ...a,
        profiles: profileMap.get(a.user_id) || null
      }));
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Manage Accounts</h2>
        <p className="text-muted-foreground">View and manage all user accounts across the platform.</p>
      </div>

      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <AdminSearch placeholder="Search by name or type..." />
          <AdminFilterDropdown 
            paramName="type"
            placeholder="Types"
            options={[
              { label: 'Cash', value: 'CASH' },
              { label: 'Bank', value: 'BANK' },
              { label: 'Mobile Banking', value: 'MOBILE_BANKING' },
            ]}
          />
        </div>
      </div>

      <Card className="glass-panel">
        <CardHeader>
          <CardTitle>All Accounts</CardTitle>
          <CardDescription>A complete list of financial accounts in the system.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="relative overflow-x-auto border-y">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase bg-muted/50 border-b">
                <tr>
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">Created Date</th>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {accounts?.map((account) => (
                  <tr key={account.id} className="border-b border-border/50 last:border-0 hover:bg-secondary/20">
                    <td className="px-6 py-4 font-mono text-xs text-muted-foreground">{account.id.substring(0, 8)}...</td>
                    <td className="px-6 py-4">
                      {account.created_at ? format(new Date(account.created_at), 'dd MMM yyyy') : 'Unknown'}
                    </td>
                    <td className="px-6 py-4 font-medium">{account.profiles?.full_name || 'Unknown User'}</td>
                    <td className="px-6 py-4 font-bold">{account.name}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center rounded-full bg-secondary px-2.5 py-0.5 text-xs font-semibold">
                        {account.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <EditAccountModal account={account} />
                        <DeleteButton 
                          onDelete={async () => {
                            'use server';
                            return await deleteAccount(account.id);
                          }} 
                          itemType="Account" 
                        />
                      </div>
                    </td>
                  </tr>
                ))}
                {(!accounts || accounts.length === 0) && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                      No accounts found matching your criteria.
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
