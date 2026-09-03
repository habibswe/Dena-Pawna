'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wallet, CreditCard, Banknote, PiggyBank, Smartphone, MoreVertical, Edit, Trash2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { deleteAccount } from '@/app/(dashboard)/accounts/actions';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { EditAccountDialog } from './edit-account-dialog';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { useTranslation } from '@/i18n/client';
import { isCreditAccountType } from '@/lib/account-types';

interface Account {
  id: string;
  name: string;
  type: string;
  balance: number;
  target_amount?: number | null;
  monthly_installment?: number | null;
  maturity_date?: string | null;
  recurrence?: string | null;
  recurring_mode?: string | null;
  source_account_id?: string | null;
  next_recurring_date?: string | null;
}

export function AccountList({ 
  accounts: initialAccounts, 
  allAccounts = [] 
}: { 
  accounts: Account[]; 
  allAccounts?: any[];
}) {
  const { t } = useTranslation();
  const [accounts, setAccounts] = useState(initialAccounts);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setAccounts(initialAccounts);
  }, [initialAccounts]);

  const handleDelete = async () => {
    if (!deletingId) return;
    setIsDeleting(true);
    
    const result = await deleteAccount(deletingId);
    
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Account deleted successfully");
      setAccounts(prev => prev.filter(a => a.id !== deletingId));
      setDeletingId(null);
      router.refresh();
    }
    setIsDeleting(false);
  };

  if (accounts.length === 0) {
    return (
      <Card className="glass-panel border-dashed text-center py-12">
        <CardContent>
          <Wallet className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium">No accounts found</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Add an account to start tracking your money.
          </p>
        </CardContent>
      </Card>
    );
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'CASH': return <Banknote className="h-5 w-5 text-emerald-500" />;
      case 'BANK': return <Wallet className="h-5 w-5 text-blue-500" />;
      case 'BKASH':
      case 'NAGAD':
      case 'ROCKET':
      case 'UPAY':
      case 'CELLFIN':
      case 'TAP':
      case 'SURECASH':
      case 'POCKET':
        return <Smartphone className="h-5 w-5 text-pink-500" />;
      case 'CREDIT_CARD':
      case 'CARD': return <CreditCard className="h-5 w-5 text-purple-500" />;
      case 'DEBIT_CARD': return <CreditCard className="h-5 w-5 text-indigo-500" />;
      case 'SAVINGS':
      case 'DPS':
      case 'FDR':
        return <PiggyBank className="h-5 w-5 text-amber-500" />;
      default: return <Wallet className="h-5 w-5 text-primary" />;
    }
  };

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

  return (
    <div className="space-y-6">
      <Card className="glass-panel border-primary/20 bg-gradient-to-br from-primary/5 via-transparent to-transparent">
        <CardContent className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Wallet className="h-4 w-4 text-primary" /> Total Wallet Balance Across All Accounts
            </p>
            <h3 className={`text-3xl sm:text-4xl font-bold tracking-tight ${totalBalance < 0 ? 'text-destructive' : 'text-primary'}`}>
              ৳{totalBalance.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
            </h3>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary border border-primary/20 font-semibold">
              {accounts.length} {accounts.length === 1 ? 'Active Wallet' : 'Active Wallets'}
            </span>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {accounts.map((acc) => {
        const isCredit = isCreditAccountType(acc.type);
        const isNegative = acc.balance < 0;
        const hasGoal = acc.target_amount && acc.target_amount > 0;
        const goalPercent = hasGoal ? Math.min(100, Math.max(0, Math.round((Math.max(0, acc.balance) / (acc.target_amount || 1)) * 100))) : 0;
        const isGoalAchieved = hasGoal && acc.balance >= (acc.target_amount || 0);

        let subtitle = (t.accounts as any)?.currentBalance || 'Current balance';
        if (isCredit) {
          if (isNegative) {
            subtitle = (t.accounts as any)?.outstandingDue || 'Outstanding Bill / Due';
          } else if (acc.balance === 0) {
            subtitle = (t.accounts as any)?.settled || 'Settled (No Due)';
          }
        }

        return (
          <Card key={acc.id} className="glass-panel hover:bg-card/60 transition-colors flex flex-col justify-between">
            <div>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-base font-medium flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-background shadow-sm border">
                    {getIcon(acc.type)}
                  </div>
                  <div className="truncate flex flex-col">
                    <span className="truncate">{acc.name}</span>
                    <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                      {isCredit && (
                        <span className="text-[10px] font-semibold text-purple-600 dark:text-purple-400">
                          Credit Card
                        </span>
                      )}
                      {['DPS', 'FDR'].includes(acc.type) && (
                        <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400">
                          {acc.type}
                        </span>
                      )}
                      {acc.recurrence && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-primary/10 text-primary border border-primary/20 font-medium">
                          {acc.recurrence === 'WEEKLY' ? 'Weekly' : 'Monthly'}
                        </span>
                      )}
                    </div>
                  </div>
                </CardTitle>
                <DropdownMenu>
                  <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="h-8 w-8" />}>
                    <MoreVertical className="h-4 w-4 text-muted-foreground" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setEditingAccount(acc)}>
                      <Edit className="mr-2 h-4 w-4" />
                      {t.common.edit}
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => setDeletingId(acc.id)}>
                      <Trash2 className="mr-2 h-4 w-4" />
                      {t.common.delete}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>

              <CardContent className="space-y-2">
                <div>
                  <div className={`text-2xl font-bold ${isNegative ? 'text-destructive' : 'text-primary'}`}>
                    ৳{acc.balance.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                  </div>
                  <p className={`text-xs mt-0.5 ${isCredit && isNegative ? 'text-destructive/80 font-medium' : 'text-muted-foreground'}`}>
                    {subtitle}
                  </p>
                </div>

                {/* DPS / Savings Goal Progress Bar */}
                {hasGoal && (
                  <div className="pt-2 space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-muted-foreground">
                        {(t.accounts as any)?.target || 'Target'}: ৳{acc.target_amount?.toLocaleString()}
                      </span>
                      <span className="font-semibold text-primary">
                        {goalPercent}%
                      </span>
                    </div>

                    <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${isGoalAchieved ? 'bg-emerald-500' : 'bg-primary'}`} 
                        style={{ width: `${goalPercent}%` }} 
                      />
                    </div>

                    {isGoalAchieved ? (
                      <div className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 pt-0.5">
                        {(t.accounts as any)?.goalAchieved || 'Goal Achieved 🎉'}
                      </div>
                    ) : (
                      acc.maturity_date && (
                        <div className="text-[11px] text-muted-foreground pt-0.5">
                          📅 Maturity: {acc.maturity_date}
                        </div>
                      )
                    )}
                  </div>
                )}
              </CardContent>
            </div>

            {/* Recurring Installment Footer */}
            {acc.monthly_installment && acc.monthly_installment > 0 && (
              <div className="px-6 pb-4 pt-1 text-[11px] text-muted-foreground border-t border-border/40 mt-2 flex items-center justify-between">
                <span>Installment: ৳{acc.monthly_installment.toLocaleString()}</span>
                {acc.recurring_mode === 'AUTO_CREATE' ? (
                  <span className="text-primary font-medium">⚡ Auto-Deposit</span>
                ) : (
                  <span>🔔 Reminder</span>
                )}
              </div>
            )}
          </Card>
        );
      })}
      
      {editingAccount && (
        <EditAccountDialog 
          account={editingAccount} 
          accounts={allAccounts}
          open={!!editingAccount} 
          onOpenChange={(open) => {
            if (!open) {
              setEditingAccount(null);
              router.refresh();
            }
          }} 
        />
      )}

      <ConfirmDialog
        isOpen={!!deletingId}
        onClose={() => !isDeleting && setDeletingId(null)}
        onConfirm={handleDelete}
        title={t.accounts.deleteTitle}
        description={t.accounts.deleteDesc}
        isDeleting={isDeleting}
      />
      </div>
    </div>
  );
}
