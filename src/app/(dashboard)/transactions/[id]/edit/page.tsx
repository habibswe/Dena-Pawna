import { createClient } from '@/lib/supabase/server';
import { EditTransactionForm } from '@/components/transactions/edit-transaction-form';
import { Button, buttonVariants } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { notFound } from 'next/navigation';

export default async function EditTransactionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const supabase = await createClient();
  const { id } = await params;
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return notFound();
  }

  const [
    { data: transaction },
    { data: people },
    { data: accounts },
    { data: categories }
  ] = await Promise.all([
    supabase.from('transactions').select('*').eq('id', id).eq('user_id', user.id).single(),
    supabase.from('people').select('*').order('name'),
    supabase.from('accounts').select('*').order('name'),
    supabase.from('categories').select('*').order('name'),
  ]);

  if (!transaction) {
    return notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/transactions" className={buttonVariants({ variant: "ghost", size: "icon" })}>
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Edit Transaction</h2>
          <p className="text-muted-foreground">Modify an existing financial activity.</p>
        </div>
      </div>

      <div className="pt-8 pb-10">
        <EditTransactionForm 
          transaction={transaction}
          people={people || []} 
          accounts={accounts || []}
          categories={categories || []}
        />
      </div>
    </div>
  );
}
