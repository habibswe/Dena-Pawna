import { createClient } from '@/lib/supabase/server';
import { calculateBalance, Transaction } from '@/lib/calculations';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button, buttonVariants } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { EditPersonButton } from '@/components/people/edit-person-button';
import { getDictionary } from '@/i18n/server';

export default async function PersonDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const t = await getDictionary();

  const [{ data: person }, { data: transactions }] = await Promise.all([
    supabase.from('people').select('*').eq('id', id).single(),
    supabase.from('transactions').select('*').eq('person_id', id).order('transaction_date', { ascending: false })
  ]);

  if (!person) return notFound();

  const allTransactions = (transactions || []) as Transaction[];
  const balance = calculateBalance(allTransactions, person);

  const isSettled = balance === 0;
  const isPositive = balance > 0;
  const color = isSettled ? 'text-muted-foreground' : isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-destructive';
  const statusText = isSettled 
    ? `${t.people.netSettled} ✓` 
    : isPositive 
      ? `${t.people.youAreOwed} (${person.name})` 
      : `${t.people.youOwe} (${person.name})`;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <Link href="/people" className={buttonVariants({ variant: "ghost", size: "icon" })}>
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{person.name}</h2>
          {person.phone && <p className="text-sm text-muted-foreground">{person.phone}</p>}
        </div>
        <div className="ml-auto">
          <EditPersonButton person={person} />
        </div>
      </div>

      <Card className="glass-panel text-center py-6 border-primary/20">
        <CardContent className="space-y-2">
          <p className="text-muted-foreground">{statusText}</p>
          <h3 className={`text-4xl font-bold ${color}`}>
            ৳{Math.abs(balance).toLocaleString()}
          </h3>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">{t.transactions.title}</h3>
        <Link href={`/transactions/new?person=${person.id}`} className={buttonVariants({ size: "sm" })}>
          <Plus className="mr-2 h-4 w-4" /> {t.dashboard.addTransaction}
        </Link>
      </div>

      <Card className="glass-panel">
        <CardContent className="p-0">
          <div className="divide-y">
            {allTransactions.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground">No transactions found.</div>
            ) : (
              allTransactions.map(tx => {
                const isCashInflow = ['INCOME', 'BORROWED', 'RECEIVED'].includes(tx.type);
                const txColor = isCashInflow ? 'text-emerald-600 dark:text-emerald-400' : 'text-destructive';
                const sign = isCashInflow ? '+' : '-';
                
                let actionText = '';
                if (tx.type === 'GIVEN') actionText = 'You gave (ধার দেওয়া)';
                else if (tx.type === 'RECEIVED') actionText = `${person.name} repaid (ধার ফেরত)`;
                else if (tx.type === 'BORROWED') actionText = 'You borrowed (ধার নেওয়া)';
                else if (tx.type === 'RETURNED') actionText = 'You repaid (ধার পরিশোধ)';
                else actionText = tx.type;

                return (
                  <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-secondary/20 transition-colors">
                    <div className="space-y-1">
                      <p className="font-medium">{actionText}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(tx.transaction_date), 'dd MMM yyyy')}
                        {tx.note && ` • ${tx.note}`}
                      </p>
                    </div>
                    <div className={`font-medium ${txColor}`}>
                      {sign}৳{Number(tx.amount).toLocaleString()}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </CardContent>
      </Card>
      
      <div className="pt-4 flex justify-center">
        <p className="text-sm font-medium">Net Balance: <span className={color}>{isSettled ? `৳0 (${t.people.netSettled} ✓)` : `${isPositive ? t.people.youAreOwed : t.people.youOwe} ৳${Math.abs(balance).toLocaleString()}`}</span></p>
      </div>
    </div>
  );
}
