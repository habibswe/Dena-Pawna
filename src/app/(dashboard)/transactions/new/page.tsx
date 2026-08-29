import { createClient } from '@/lib/supabase/server';
import { AddTransactionForm } from '@/components/transactions/add-transaction-form';
import { Button, buttonVariants } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default async function NewTransactionPage({
  searchParams,
}: {
  searchParams: { person?: string };
}) {
  const supabase = await createClient();
  const { person } = await searchParams;

  const { data: people } = await supabase.from('people').select('*').order('name');

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={person ? `/people/${person}` : '/transactions'} className={buttonVariants({ variant: "ghost", size: "icon" })}>
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">New Transaction</h2>
          <p className="text-muted-foreground">Record a new lending or borrowing activity.</p>
        </div>
      </div>

      <div className="pt-4">
        <AddTransactionForm people={people || []} defaultPersonId={person} />
      </div>
    </div>
  );
}
