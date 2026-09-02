import { createAdminClient } from '@/lib/supabase/admin';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AdminSearch } from '@/components/admin/admin-search';
import { AdminPagination } from '@/components/admin/admin-pagination';
import { CreateAccountTypeModal } from '@/components/admin/create-account-type-modal';
import { EditAccountTypeModal } from '@/components/admin/edit-account-type-modal';
import { DeleteButton } from '@/components/ui/delete-button';
import { deleteAccountType } from './actions';
import { DEFAULT_ACCOUNT_TYPES, AccountTypeItem } from '@/lib/account-types';
import * as Icons from 'lucide-react';

export default async function AdminAccountTypesPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string, page?: string }>;
}) {
  const supabase = createAdminClient();
  const searchParamsResolved = await searchParams;
  const search = searchParamsResolved.search;
  const page = parseInt(searchParamsResolved.page || '1');
  const PAGE_SIZE = 20;
  const offset = (page - 1) * PAGE_SIZE;

  let accountTypes: AccountTypeItem[] = [];
  let totalCount = 0;

  try {
    let query = supabase.from('account_types').select('*', { count: 'exact' }).order('created_at', { ascending: true });

    if (search) {
      query = query.or(`name.ilike.%${search}%,code.ilike.%${search}%`);
    }

    query = query.range(offset, offset + PAGE_SIZE - 1);
    const { data, count, error } = await query;

    if (!error && data && data.length > 0) {
      accountTypes = data;
      totalCount = count || data.length;
    } else {
      accountTypes = DEFAULT_ACCOUNT_TYPES;
      totalCount = DEFAULT_ACCOUNT_TYPES.length;
    }
  } catch (err) {
    accountTypes = DEFAULT_ACCOUNT_TYPES;
    totalCount = DEFAULT_ACCOUNT_TYPES.length;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Manage Account Types</h2>
          <p className="text-muted-foreground">Configure dynamic account categories (Cash, Bank, Mobile Banking, Cards) for all users.</p>
        </div>
        <CreateAccountTypeModal />
      </div>

      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <AdminSearch placeholder="Search account types..." />
        </div>
      </div>

      <Card className="glass-panel">
        <CardHeader>
          <CardTitle>Account Types</CardTitle>
          <CardDescription>A list of account types available in the system.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="relative overflow-x-auto border-y">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase bg-muted/50 border-b">
                <tr>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">System Code</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {accountTypes?.map((item) => {
                  const Icon = (Icons as any)[item.icon || 'CreditCard'] || Icons.CreditCard;
                  const isActive = item.is_active !== false;

                  return (
                    <tr key={item.id} className="border-b border-border/50 last:border-0 hover:bg-secondary/20">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3 font-bold">
                          <div className="bg-primary/10 p-2 rounded-xl text-primary">
                            <Icon className="w-4 h-4" />
                          </div>
                          {item.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-muted-foreground">
                        <span className="bg-secondary px-2 py-1 rounded font-semibold text-foreground">
                          {item.code}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {isActive ? (
                          <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-500 border border-emerald-500/20">
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <EditAccountTypeModal item={item} />
                          <DeleteButton 
                            onDelete={async () => {
                              'use server';
                              return await deleteAccountType(item.id);
                            }} 
                            itemType="Account Type" 
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <AdminPagination totalCount={totalCount} pageSize={PAGE_SIZE} />
        </CardContent>
      </Card>
    </div>
  );
}
