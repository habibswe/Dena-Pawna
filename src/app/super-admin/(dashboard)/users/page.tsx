import { createAdminClient } from '@/lib/supabase/admin';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button, buttonVariants } from '@/components/ui/button';
import { Trash2, LayoutDashboard } from 'lucide-react';
import { deleteSystemUser } from '../actions';
import { format } from 'date-fns';
import Link from 'next/link';
import { AdminSearch } from '@/components/admin/admin-search';
import { AdminPagination } from '@/components/admin/admin-pagination';
import { CreateUserModal } from '@/components/admin/create-user-modal';
import { EditUserModal } from '@/components/admin/edit-user-modal';
import { DeleteButton } from '@/components/ui/delete-button';

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string, search?: string }>;
}) {
  const supabase = createAdminClient();
  const searchParamsResolved = await searchParams;
  const page = parseInt(searchParamsResolved.page || '1');
  const search = searchParamsResolved.search;
  
  const PAGE_SIZE = 20;
  const offset = (page - 1) * PAGE_SIZE;

  // Fetch all users to do JS filtering since Supabase Auth API lacks advanced filtering
  const { data: authData, error: usersError } = await supabase.auth.admin.listUsers({
    perPage: 1000,
  });
  let users = authData?.users || [];

  if (usersError) {
    console.error("Error fetching users:", usersError);
  }

  // Fetch all profiles
  let profiles: any[] = [];
  const { data: profilesData } = await supabase.from('profiles').select('*');
  if (profilesData) profiles = profilesData;

  // Map users
  let mappedUsers = users.map(user => ({
    ...user,
    profile: profiles.find(p => p.id === user.id) || null
  }));

  // Apply Search Filter
  if (search) {
    const s = search.toLowerCase();
    mappedUsers = mappedUsers.filter(u => 
      u.email?.toLowerCase().includes(s) || 
      u.profile?.full_name?.toLowerCase().includes(s)
    );
  }

  const total = mappedUsers.length;
  
  // Paginate in JS
  const paginatedUsers = mappedUsers.slice(offset, offset + PAGE_SIZE);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">System Users</h2>
          <p className="text-muted-foreground">Manage the accounts that have login access to the platform.</p>
        </div>
        <CreateUserModal />
      </div>

      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="w-full sm:w-96 flex-1">
          <AdminSearch placeholder="Search by name or email..." />
        </div>
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
                {paginatedUsers.map((user) => (
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
                        <Link 
                          href={`/super-admin/users/${user.id}/overview`} 
                          className={buttonVariants({ variant: "outline", size: "icon" })} 
                          title="View User Dashboard"
                        >
                          <LayoutDashboard className="h-4 w-4 text-primary" />
                        </Link>
                        <EditUserModal user={user} />
                        <DeleteButton 
                          onDelete={async () => {
                            'use server';
                            return await deleteSystemUser(user.id);
                          }} 
                          itemType="System User" 
                        />
                      </div>
                    </td>
                  </tr>
                ))}
                {paginatedUsers.length === 0 && (
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
