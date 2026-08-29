import { createClient } from '@/lib/supabase/server';
import { calculateSummary, calculateBalance, Transaction, TransactionType } from '@/lib/calculations';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowDownLeft, ArrowUpRight, Wallet, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Button, buttonVariants } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { format } from 'date-fns';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null; // Handled by middleware

  // Fetch people and transactions
  const [{ data: people }, { data: transactions }] = await Promise.all([
    supabase.from('people').select('*'),
    supabase.from('transactions').select('*').order('transaction_date', { ascending: false })
  ]);

  const allTransactions = (transactions || []) as Transaction[];
  const allPeople = (people || []);

  // Calculate balances for each person
  const peopleBalances = allPeople.map(person => {
    const personTxs = allTransactions.filter(tx => tx.person_id === person.id);
    return {
      ...person,
      balance: calculateBalance(personTxs)
    };
  });

  const { youAreOwed, youOwe, netBalance } = calculateSummary(peopleBalances.map(p => p.balance));
  
  const recentTransactions = allTransactions.slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Overview</h2>
          <p className="text-muted-foreground">Welcome back. Here's your money summary.</p>
        </div>
        <Link href="/transactions/new" className={buttonVariants()}>
          + Add Transaction
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="glass-panel border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Balance</CardTitle>
            <Wallet className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${netBalance >= 0 ? 'text-primary' : 'text-destructive'}`}>
              {netBalance >= 0 ? '' : '-'}৳{Math.abs(netBalance).toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card className="glass-panel border-primary/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">People Owe You</CardTitle>
            <ArrowDownLeft className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              ৳{youAreOwed.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card className="glass-panel border-destructive/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">You Owe Others</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              ৳{youOwe.toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="col-span-1 glass-panel">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>Your latest financial activities</CardDescription>
            </div>
            <Link href="/transactions" className={buttonVariants({ variant: "ghost", size: "sm" })}>
              View All <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTransactions.length === 0 ? (
                <div className="text-center text-muted-foreground py-4">No transactions yet.</div>
              ) : (
                recentTransactions.map(tx => {
                  const person = allPeople.find(p => p.id === tx.person_id);
                  const isPositive = tx.type === 'GIVEN' || tx.type === 'RETURNED'; // They owe you more, or you owe them less
                  const sign = isPositive ? '+' : '-';
                  const color = isPositive ? 'text-primary' : 'text-destructive';
                  
                  // UI Text
                  let actionText = '';
                  if (tx.type === 'GIVEN') actionText = 'You gave';
                  if (tx.type === 'RECEIVED') actionText = 'You received';
                  if (tx.type === 'BORROWED') actionText = 'You borrowed';
                  if (tx.type === 'RETURNED') actionText = 'You returned';

                  return (
                    <div key={tx.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9 border border-primary/20">
                          <AvatarFallback className="bg-primary/5 text-primary">
                            {person?.name.substring(0, 2).toUpperCase() || '?'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="space-y-1">
                          <p className="text-sm font-medium leading-none">{person?.name || 'Unknown'}</p>
                          <p className="text-xs text-muted-foreground">
                            {actionText} • {format(new Date(tx.transaction_date), 'dd MMM yyyy')}
                          </p>
                        </div>
                      </div>
                      <div className={`font-medium ${color}`}>
                        {sign}৳{Number(tx.amount).toLocaleString()}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1 glass-panel">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>People Summary</CardTitle>
              <CardDescription>Who owes who</CardDescription>
            </div>
            <Link href="/people" className={buttonVariants({ variant: "ghost", size: "sm" })}>
              View All <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {peopleBalances.length === 0 ? (
                <div className="text-center text-muted-foreground py-4">No people added yet.</div>
              ) : (
                peopleBalances.slice(0, 5).map(person => {
                  if (person.balance === 0) return null;
                  const isPositive = person.balance > 0;
                  const color = isPositive ? 'text-primary' : 'text-destructive';
                  const sign = isPositive ? '+' : '-';
                  
                  return (
                    <div key={person.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9 border border-primary/20">
                          <AvatarFallback className="bg-primary/5 text-primary">
                            {person.name.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="space-y-1">
                          <p className="text-sm font-medium leading-none">{person.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {isPositive ? 'Owes you' : 'You owe'}
                          </p>
                        </div>
                      </div>
                      <div className={`font-medium ${color}`}>
                        {sign}৳{Math.abs(person.balance).toLocaleString()}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
