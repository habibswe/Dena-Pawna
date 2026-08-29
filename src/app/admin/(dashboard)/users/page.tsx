import { createAdminClient } from '@/lib/supabase/admin';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { deleteSystemUser } from '../actions';
import { format } from 'date-fns';
import { AdminPagination } from '@/components/admin/admin-pagination';
import { CreateUserModal } from '@/components/admin/create-user-modal';
import { EditUserModal } from '@/components/admin/edit-user-modal';

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const supabase = createAdminClient();
  const searchParamsResolved = await searchParams;
  const page = parseInt(searchParamsResolved.page || '1');
  const PAGE_SIZE = 20;

  const { data: authData, error: usersError } = await supabase.auth.admin.listUsers({
    page: page,
    perPage: PAGE_SIZE,
  });
  const users = authData?.users || [];

  const { count: total } = await supabase.from('profiles').select('*', { count: 'exact', head: true });

  if (usersError) {
    console.error("Error fetching users:", usersError);
  }

  // Fetch all profiles that match the fetched users to get their full_names
  const userIds = users?.map(u => u.id) || [];
  let profiles: any[] = [];
  if (userIds.length > 0) {
    const { data } = await supabase.from('profiles').select('*').in('id', userIds);
    if (data) profiles = data;
  }

  const mappedUsers = users?.map(user => {
    return {
      ...user,
      profile: profiles.find(p => p.id === user.id) || null
    };
  }) || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">System Users</h2>
          <p className="text-muted-foreground">Manage the accounts that have login access to the platform.</p>
        </div>
        <CreateUserModal />
      </div>

      <Card className="glass-panel">
        <CardHeader>
          <CardTitle>All System Users</CardTitle>
          <CardDescription>A complete list of authenticated users in the system.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="relative overflow-x-auto border-y">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase bg-muted/50 border-b">
                <tr>
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Full Name</th>
                  <th className="px-6 py-4">Created At</th>
                  <th className="px-6 py-4">Last Sign In</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {mappedUsers.map((user) => (
                  <tr key={user.id} className="border-b border-border/50 last:border-0 hover:bg-secondary/20">
                    <td className="px-6 py-4 font-mono text-xs text-muted-foreground">{user.id.substring(0, 8)}...</td>
                    <td className="px-6 py-4 font-medium">{user.email}</td>
                    <td className="px-6 py-4">{user.profile?.full_name || 'N/A'}</td>
                    <td className="px-6 py-4">
                      {user.created_at ? format(new Date(user.created_at), 'dd MMM yyyy') : 'Unknown'}
                    </td>
                    <td className="px-6 py-4">
                      {user.last_sign_in_at ? format(new Date(user.last_sign_in_at), 'dd MMM yyyy, p') : 'Never'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <EditUserModal user={user} />
                        <form action={async () => {
                          'use server';
                          await deleteSystemUser(user.id);
                        }}>
                          <Button variant="destructive" size="sm" type="submit">
                            <Trash2 className="h-4 w-4 mr-2" /> Delete
                          </Button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
                {mappedUsers.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <AdminPagination totalCount={total || 0} pageSize={PAGE_SIZE} />
        </CardContent>
      </Card>
    </div>
  );
}
