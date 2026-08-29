import { createAdminClient } from '@/lib/supabase/admin';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { deletePerson } from '../actions';
import { format } from 'date-fns';
import { AdminSearch } from '@/components/admin/admin-search';
import { AdminDateFilter } from '@/components/admin/admin-date-filter';
import { AdminPagination } from '@/components/admin/admin-pagination';
import { EditPersonModal } from '@/components/admin/edit-person-modal';
import { CreatePersonModal } from '@/components/admin/create-person-modal';
import { DeleteButton } from '@/components/ui/delete-button';

export default async function AdminPeoplePage({
  searchParams,
}: {
  searchParams: { search?: string, from?: string, to?: string, page?: string };
}) {
  const supabase = createAdminClient();
  const searchParamsResolved = await searchParams;
  const search = searchParamsResolved.search;
  const from = searchParamsResolved.from;
  const to = searchParamsResolved.to;
  const page = parseInt(searchParamsResolved.page || '1');
  const PAGE_SIZE = 20;
  const offset = (page - 1) * PAGE_SIZE;

  let query = supabase.from('people').select('*', { count: 'exact' }).order('created_at', { ascending: false });

  if (search) {
    query = query.or(`name.ilike.%${search}%,phone.ilike.%${search}%`);
  }

  if (from && to) {
    query = query.gte('created_at', new Date(from).toISOString()).lte('created_at', new Date(`${to}T23:59:59.999Z`).toISOString());
  } else if (from) {
    query = query.gte('created_at', new Date(from).toISOString());
  } else if (to) {
    query = query.lte('created_at', new Date(`${to}T23:59:59.999Z`).toISOString());
  }

  query = query.range(offset, offset + PAGE_SIZE - 1);

  const { data: people, count } = await query;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Manage People</h2>
        <p className="text-muted-foreground">View and manage all people profiles created by users.</p>
      </div>

      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <AdminSearch placeholder="Search by name or phone..." />
        <AdminDateFilter />
      </div>

      <Card className="glass-panel">
        <CardHeader>
          <CardTitle>All People</CardTitle>
          <CardDescription>A complete list of people tracked in the system.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="relative overflow-x-auto border-y">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase bg-muted/50 border-b">
                <tr>
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Phone</th>
                  <th className="px-6 py-4">Created At</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {people?.map((person) => (
                  <tr key={person.id} className="border-b border-border/50 last:border-0 hover:bg-secondary/20">
                    <td className="px-6 py-4 font-mono text-xs text-muted-foreground">{person.id.substring(0, 8)}...</td>
                    <td className="px-6 py-4 font-medium">{person.name}</td>
                    <td className="px-6 py-4">{person.phone || 'N/A'}</td>
                    <td className="px-6 py-4">
                      {person.created_at ? format(new Date(person.created_at), 'dd MMM yyyy') : 'Unknown'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <EditPersonModal person={person} />
                        <DeleteButton 
                          onDelete={async () => {
                            'use server';
                            return await deletePerson(person.id);
                          }} 
                          itemType="Person" 
                        />
                      </div>
                    </td>
                  </tr>
                ))}
                {(!people || people.length === 0) && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                      No people found matching your criteria.
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
