import { createClient } from '@/lib/supabase/server';
import { calculateBalance, Transaction } from '@/lib/calculations';
import { AddPersonDialog } from '@/components/people/add-person-dialog';
import { PeopleListClient } from '@/components/people/people-list-client';

export default async function PeoplePage() {
  const supabase = await createClient();

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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">People</h2>
          <p className="text-muted-foreground">Manage your contacts and their balances.</p>
        </div>
        <AddPersonDialog />
      </div>

      <PeopleListClient peopleBalances={peopleBalances} />
    </div>
  );
}
