import { createClient } from '@/lib/supabase/server';
import { calculateBalance, Transaction } from '@/lib/calculations';
import { AddPersonDialog } from '@/components/people/add-person-dialog';
import { PeopleListClient } from '@/components/people/people-list-client';
import { getDictionary } from '@/i18n/server';

export default async function PeoplePage() {
  const supabase = await createClient();
  const t = await getDictionary();

  const [{ data: people }, { data: transactions }] = await Promise.all([
    supabase.from('people').select('*').order('name'),
    supabase.from('transactions').select('*')
  ]);

  const allTransactions = (transactions || []) as Transaction[];
  const allPeople = (people || []);

  const peopleBalances = allPeople.map(person => {
    const personTxs = allTransactions.filter(tx => tx.person_id === person.id);
    return {
      ...person,
      balance: calculateBalance(personTxs)
    };
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{t.people.title}</h2>
          <p className="text-muted-foreground">{t.people.subtitle}</p>
        </div>
        <AddPersonDialog />
      </div>

      <PeopleListClient peopleBalances={peopleBalances} />
    </div>
  );
}
