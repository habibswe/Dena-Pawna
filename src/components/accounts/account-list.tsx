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

interface Account {
  id: string;
  name: string;
  type: string;
  balance: number;
}

export function AccountList({ accounts: initialAccounts }: { accounts: Account[] }) {
  const [accounts, setAccounts] = useState(initialAccounts);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const router = useRouter();

  useEffect(() => {
    setAccounts(initialAccounts);
  }, [initialAccounts]);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this account? It will be removed from all linked transactions.")) return;
    
    const result = await deleteAccount(id);
    
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Account deleted successfully");
      setAccounts(prev => prev.filter(a => a.id !== id));
      router.refresh();
    }
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
      case 'NAGAD': return <Smartphone className="h-5 w-5 text-pink-500" />;
      case 'CARD': return <CreditCard className="h-5 w-5 text-purple-500" />;
      case 'SAVINGS': return <PiggyBank className="h-5 w-5 text-amber-500" />;
      default: return <Wallet className="h-5 w-5 text-primary" />;
    }
  };

  return (
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
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => handleDelete(acc.id)}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
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
              router.refresh(); // Refresh to get updated accounts from server
            }
          }} 
        />
      )}
    </div>
  );
}
