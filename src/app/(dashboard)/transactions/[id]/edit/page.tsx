import { createClient } from '@/lib/supabase/server';
import { EditTransactionForm } from '@/components/transactions/edit-transaction-form';
import { Button, buttonVariants } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { notFound } from 'next/navigation';
import { cn } from '@/lib/utils';

export default async function EditTransactionPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ type?: string, grid?: string }>;
}) {
  const supabase = await createClient();
  const { id } = await params;
  const { type, grid } = await searchParams;
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

  const currentType = type || transaction.type;
  const showGrid = grid === 'true';

  const TYPE_DETAILS: Record<string, { title: string; desc: string }> = {
    EXPENSE: { title: 'Edit Expense', desc: 'Modify a money spent record.' },
    INCOME: { title: 'Edit Income', desc: 'Modify a money received record.' },
    TRANSFER: { title: 'Edit Transfer', desc: 'Modify a funds transfer.' },
    SAVING: { title: 'Edit Saving', desc: 'Modify a savings record.' },
    GIVEN: { title: 'Edit Lent Money', desc: 'Modify money you lent.' },
    RECEIVED: { title: 'Edit Repayment', desc: 'Modify money returned to you.' },
    BORROWED: { title: 'Edit Borrowing', desc: 'Modify money you borrowed.' },
    RETURNED: { title: 'Edit Repayment', desc: 'Modify money you returned.' },
  };

  const pageTitle = showGrid ? 'Change Transaction Type' : (TYPE_DETAILS[currentType]?.title || 'Edit Transaction');
  const pageDesc = showGrid ? 'Select a new type for this transaction.' : (TYPE_DETAILS[currentType]?.desc || 'Modify an existing financial activity.');
  const backLink = showGrid ? `/transactions/${id}/edit` : '/transactions';

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <Link href={backLink} className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "h-10 w-10 sm:h-12 sm:w-12 shrink-0")}>
          <ArrowLeft className="h-5 w-5 sm:h-6 sm:w-6" />
        </Link>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{pageTitle}</h2>
          <p className="text-muted-foreground">{pageDesc}</p>
        </div>
      </div>

      <div className="pt-8 pb-10">
        <EditTransactionForm 
          transaction={transaction}
          people={people || []} 
          accounts={accounts || []}
          categories={categories || []}
          currentType={currentType}
          showGrid={showGrid}
        />
      </div>
    </div>
  );
}
