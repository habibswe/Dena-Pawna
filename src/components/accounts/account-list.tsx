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

interface Account {
  id: string;
  name: string;
  type: string;
  balance: number;
}

export function AccountList({ accounts: initialAccounts }: { accounts: Account[] }) {
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
      case 'CARD': return <CreditCard className="h-5 w-5 text-purple-500" />;
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
      {accounts.map((acc) => (
        <Card key={acc.id} className="glass-panel hover:bg-card/60 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <div className="p-2 rounded-lg bg-background shadow-sm border">
                {getIcon(acc.type)}
              </div>
              <span className="truncate">{acc.name}</span>
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
          <CardContent>
            <div className={`text-2xl font-bold ${acc.balance < 0 ? 'text-destructive' : 'text-primary'}`}>
              ৳{acc.balance.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Current balance
            </p>
          </CardContent>
        </Card>
      ))}
      
      {editingAccount && (
        <EditAccountDialog 
          account={editingAccount} 
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
