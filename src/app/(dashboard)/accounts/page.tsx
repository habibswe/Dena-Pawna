import { createClient } from '@/lib/supabase/server';
import { calculateAccountBalance, Transaction } from '@/lib/calculations';
import { AddAccountDialog } from '@/components/accounts/add-account-dialog';
import { AccountList } from '@/components/accounts/account-list';

export default async function AccountsPage() {
  const supabase = await createClient();

  const [{ data: accounts }, { data: transactions }] = await Promise.all([
    supabase.from('accounts').select('*').order('name'),
    supabase.from('transactions').select('*')
  ]);

  const allTransactions = (transactions || []) as Transaction[];
  const allAccounts = (accounts || []);

  const accountBalances = allAccounts.map(acc => {
    return {
      ...acc,
      balance: calculateAccountBalance(acc.id, allTransactions)
    };
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Accounts</h2>
          <p className="text-muted-foreground">Manage your wallets and bank accounts.</p>
        </div>
        <AddAccountDialog />
      </div>

      <AccountList accounts={accountBalances} />
    </div>
  );
}
