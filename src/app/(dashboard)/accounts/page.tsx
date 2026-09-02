import { createClient } from '@/lib/supabase/server';
import { calculateAccountBalance, Transaction } from '@/lib/calculations';
import { AddAccountDialog } from '@/components/accounts/add-account-dialog';
import { AccountList } from '@/components/accounts/account-list';
import { getDictionary } from '@/i18n/server';

export default async function AccountsPage() {
  const supabase = await createClient();
  const t = await getDictionary();

  const [{ data: accounts }, { data: transactions }] = await Promise.all([
    supabase.from('accounts').select('*').order('name'),
    supabase.from('transactions').select('id, account_id, to_account_id, type, amount')
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
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{t.accounts.title}</h2>
          <p className="text-muted-foreground">{t.accounts.subtitle}</p>
        </div>
        <AddAccountDialog />
      </div>

      <AccountList accounts={accountBalances} />
    </div>
  );
}
