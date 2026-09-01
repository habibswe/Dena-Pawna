import { createClient } from '@/lib/supabase/server';
import { AddTransactionForm } from '@/components/transactions/add-transaction-form';
import { getDictionary } from '@/i18n/server';
import { Suspense } from 'react';
import { SkeletonForm, SkeletonHeader, SkeletonTransactionGrid } from '@/components/ui/skeletons';

async function DataLoader({ person, type, pageTitle, pageDesc, backLink }: { person?: string, type?: string, pageTitle: string, pageDesc: string, backLink: string }) {
  const supabase = await createClient();
  const [
    { data: people },
    { data: accounts },
    { data: categories }
  ] = await Promise.all([
    supabase.from('people').select('*').order('name'),
    supabase.from('accounts').select('*').order('name'),
    supabase.from('categories').select('*').order('name'),
  ]);

  return (
    <AddTransactionForm 
      people={people || []} 
      accounts={accounts || []}
      categories={categories || []}
      defaultPersonId={person} 
      defaultType={type}
      pageTitle={pageTitle}
      pageDesc={pageDesc}
      backLink={backLink}
    />
  );
}

export default async function NewTransactionPage({
  searchParams,
}: {
  searchParams: Promise<{ person?: string, type?: string }>;
}) {
  const t = await getDictionary();
  const { person, type } = await searchParams;

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
    <div className="pb-10 animate-in fade-in duration-500">
      <Suspense fallback={
        <div className="space-y-6 w-full">
          <SkeletonHeader title subtitle button={false} />
          {type ? <SkeletonForm /> : <SkeletonTransactionGrid />}
        </div>
      }>
        <DataLoader person={person} type={type} pageTitle={pageTitle} pageDesc={pageDesc} backLink={backLink} />
      </Suspense>
    </div>
  );
}
