import { createClient } from '@/lib/supabase/server';
import { AddTransactionForm } from '@/components/transactions/add-transaction-form';
import { Button, buttonVariants } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getDictionary } from '@/i18n/server';

export default async function NewTransactionPage({
  searchParams,
}: {
  searchParams: Promise<{ person?: string, type?: string }>;
}) {
  const supabase = await createClient();
  const t = await getDictionary();
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
    EXPENSE: { title: t.addTransactionForm.addExpense, desc: t.addTransactionForm.addExpenseDesc },
    INCOME: { title: t.addTransactionForm.addIncome, desc: t.addTransactionForm.addIncomeDesc },
    TRANSFER: { title: t.addTransactionForm.transferMoney, desc: t.addTransactionForm.transferMoneyDesc },
    SAVING: { title: t.addTransactionForm.addSaving, desc: t.addTransactionForm.addSavingDesc },
    GIVEN: { title: t.addTransactionForm.lendMoney, desc: t.addTransactionForm.lendMoneyDesc },
    RECEIVED: { title: t.addTransactionForm.repaymentReceived, desc: t.addTransactionForm.repaymentReceivedDesc },
    BORROWED: { title: t.addTransactionForm.borrowMoney, desc: t.addTransactionForm.borrowMoneyDesc },
    RETURNED: { title: t.addTransactionForm.repayMoney, desc: t.addTransactionForm.repayMoneyDesc },
  };

  const pageTitle = type ? (TYPE_DETAILS[type]?.title || t.transactions.addNew) : t.addTransactionForm.title;
  const pageDesc = type ? (TYPE_DETAILS[type]?.desc || t.addTransactionForm.subtitle) : t.addTransactionForm.subtitle;
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
