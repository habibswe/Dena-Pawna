import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { ArrowDownLeft, ArrowUpRight, ArrowLeftRight, CreditCard } from 'lucide-react';
import { DateFilter } from '@/components/ui/date-filter';
import { ExportButtons } from '@/components/ui/export-buttons';
import { getDictionary } from '@/i18n/server';

export default async function SummaryPage(props: { searchParams: Promise<{ filter?: string, from?: string, to?: string }> }) {
  const searchParams = await props.searchParams;
  const fromDate = searchParams.from;
  const toDate = searchParams.to;
  const supabase = await createClient();
  const t = await getDictionary();

  let query = supabase.from('transactions').select('*');
  let titleText = '';
  let subtitleText = '';

  if (fromDate && toDate) {
    query = query.gte('transaction_date', new Date(fromDate).toISOString()).lte('transaction_date', new Date(`${toDate}T23:59:59.999Z`).toISOString());
    titleText = `Summary from ${format(new Date(fromDate), 'dd MMM yyyy')} to ${format(new Date(toDate), 'dd MMM yyyy')}`;
    subtitleText = 'Total transaction volume for selected dates';
  } else if (fromDate) {
    query = query.gte('transaction_date', new Date(fromDate).toISOString());
    titleText = `Summary from ${format(new Date(fromDate), 'dd MMM yyyy')}`;
    subtitleText = 'Total transaction volume since selected date';
  } else if (toDate) {
    query = query.lte('transaction_date', new Date(`${toDate}T23:59:59.999Z`).toISOString());
    titleText = `Summary up to ${format(new Date(toDate), 'dd MMM yyyy')}`;
    subtitleText = 'Total transaction volume up to selected date';
  } else {
    // Default to lifetime if nothing is set
    titleText = t.dashboard.debtSubtitle;
    subtitleText = 'Total transaction volume across all time';
  }

  const [{ data: transactionsData }, { data: peopleData }] = await Promise.all([
    query,
    supabase.from('people').select('*')
  ]);
  const transactions = transactionsData || [];
  const people = peopleData || [];

  let given = 0;
  let received = 0;
  let borrowed = 0;
  let returned = 0;

  transactions.forEach(tx => {
    const amount = Number(tx.amount);
    if (tx.type === 'GIVEN') given += amount;
    if (tx.type === 'RECEIVED') received += amount;
    if (tx.type === 'BORROWED') borrowed += amount;
    if (tx.type === 'RETURNED') returned += amount;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{t.summary.title}</h2>
          <p className="text-muted-foreground">{titleText}</p>
        </div>
        <div className="flex flex-col sm:flex-row items-end gap-4">
          <DateFilter />
          <div className="sm:border-l sm:border-border sm:pl-4 w-full sm:w-auto">
            <ExportButtons transactions={transactions} people={people} />
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="glass-panel border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.summary.moneyGiven}</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">৳{given.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card className="glass-panel border-primary/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.summary.moneyReceived}</CardTitle>
            <ArrowDownLeft className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">৳{received.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card className="glass-panel border-destructive/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.summary.moneyBorrowed}</CardTitle>
            <ArrowDownLeft className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-destructive">৳{borrowed.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card className="glass-panel border-destructive/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t.summary.moneyReturned}</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-destructive">৳{returned.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>
      
      <Card className="glass-panel">
        <CardHeader>
          <CardTitle>{t.summary.totalVolume}</CardTitle>
        </CardHeader>
        <CardContent>
           <div className="text-4xl font-bold text-foreground">
             ৳{(given + received + borrowed + returned).toLocaleString()}
           </div>
           <p className="text-sm text-muted-foreground mt-2">{subtitleText}</p>
        </CardContent>
      </Card>
    </div>
  );
}
