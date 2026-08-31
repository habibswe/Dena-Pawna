import { createClient } from '@/lib/supabase/server';
import { AddTransactionForm } from '@/components/transactions/add-transaction-form';
import { Button, buttonVariants } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

export default async function NewTransactionPage({
  searchParams,
}: {
  searchParams: Promise<{ person?: string, type?: string }>;
}) {
  const supabase = await createClient();
  const { person, type } = await searchParams;

  const [
    { data: people },
    { data: accounts },
    { data: categories }
  ] = await Promise.all([
    supabase.from('people').select('*').order('name'),
    supabase.from('accounts').select('*').order('name'),
    supabase.from('categories').select('*').order('name'),
  ]);

  const TYPE_DETAILS: Record<string, { title: string; desc: string }> = {
    EXPENSE: { title: 'Add Expense', desc: 'Record money spent.' },
    INCOME: { title: 'Add Income', desc: 'Record money received.' },
    TRANSFER: { title: 'Transfer Money', desc: 'Move funds between your accounts.' },
    SAVING: { title: 'Add Saving', desc: 'Record money set aside for savings.' },
    GIVEN: { title: 'Lend Money', desc: 'Record money you gave or lent to someone.' },
    RECEIVED: { title: 'Repayment Received', desc: 'Record money returned to you.' },
    BORROWED: { title: 'Borrow Money', desc: 'Record money you borrowed from someone.' },
    RETURNED: { title: 'Repay Money', desc: 'Record money you returned to someone.' },
  };

  const pageTitle = type ? (TYPE_DETAILS[type]?.title || 'New Transaction') : 'Select Transaction Type';
  const pageDesc = type ? (TYPE_DETAILS[type]?.desc || 'Record a new financial activity.') : 'Choose the type of activity you want to record.';
  const backLink = person ? `/people/${person}` : (type ? '/transactions/new' : '/transactions');

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        {type && (
          <Link href={backLink} className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "h-10 w-10 sm:h-12 sm:w-12 shrink-0")}>
            <ArrowLeft className="h-5 w-5 sm:h-6 sm:w-6" />
          </Link>
        )}
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{pageTitle}</h2>
          <p className="text-muted-foreground">{pageDesc}</p>
        </div>
      </div>

      <div className="pt-8 pb-10">
        <AddTransactionForm 
          people={people || []} 
          accounts={accounts || []}
          categories={categories || []}
          defaultPersonId={person} 
          defaultType={type}
        />
      </div>
    </div>
  );
}
