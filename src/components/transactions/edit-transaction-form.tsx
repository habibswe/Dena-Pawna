'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Loader2, 
  ArrowRight, 
  ArrowDown,
  TrendingDown, 
  TrendingUp, 
  ArrowRightLeft, 
  PiggyBank, 
  Send, 
  Handshake, 
  Download, 
  Upload 
} from 'lucide-react';
import { toast } from 'sonner';
import { updateTransaction } from '@/app/(dashboard)/transactions/actions';
import { AddPersonDialog } from '../people/add-person-dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useTranslation } from '@/i18n/client';

export function EditTransactionForm({ 
  transaction,
  people, 
  accounts,
  categories,
  currentType,
  showGrid,
}: { 
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transaction: any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  people: any[], 
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  accounts: any[],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  categories: any[],
  currentType: string,
  showGrid: boolean,
}) {
  const router = useRouter();
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);

  const TRANSACTION_TYPES = [
    { id: 'EXPENSE', label: t.addTransactionForm.addExpense, icon: TrendingDown, color: 'text-red-500', bg: 'hover:bg-red-500/10 border-red-500/20' },
    { id: 'INCOME', label: t.addTransactionForm.addIncome, icon: TrendingUp, color: 'text-green-500', bg: 'hover:bg-green-500/10 border-green-500/20' },
    { id: 'TRANSFER', label: t.addTransactionForm.transferMoney, icon: ArrowRightLeft, color: 'text-blue-500', bg: 'hover:bg-blue-500/10 border-blue-500/20' },
    { id: 'SAVING', label: t.addTransactionForm.addSaving, icon: PiggyBank, color: 'text-purple-500', bg: 'hover:bg-purple-500/10 border-purple-500/20' },
    { id: 'GIVEN', label: t.addTransactionForm.lendMoney, icon: Send, color: 'text-orange-500', bg: 'hover:bg-orange-500/10 border-orange-500/20' },
    { id: 'RECEIVED', label: t.addTransactionForm.repaymentReceived, icon: Handshake, color: 'text-emerald-500', bg: 'hover:bg-emerald-500/10 border-emerald-500/20' },
    { id: 'BORROWED', label: t.addTransactionForm.borrowMoney, icon: Download, color: 'text-rose-500', bg: 'hover:bg-rose-500/10 border-rose-500/20' },
    { id: 'RETURNED', label: t.addTransactionForm.repayMoney, icon: Upload, color: 'text-indigo-500', bg: 'hover:bg-indigo-500/10 border-indigo-500/20' },
  ];
  
  const [personId, setPersonId] = useState(transaction.person_id || '');
  const [accountId, setAccountId] = useState(transaction.account_id || '');
  const [toAccountId, setToAccountId] = useState(transaction.to_account_id || '');
  const [categoryId, setCategoryId] = useState(transaction.category_id || '');
  
  const [localPeople, setLocalPeople] = useState(people);
  const [dueDate, setDueDate] = useState<Date | undefined>(transaction.due_date ? new Date(transaction.due_date) : undefined);
  const [transactionDate, setTransactionDate] = useState<Date>(transaction.transaction_date ? new Date(transaction.transaction_date) : new Date());

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    
    formData.set('id', transaction.id);
    formData.set('type', currentType);
    if (personId) formData.set('person_id', personId);
    if (accountId) formData.set('account_id', accountId);
    if (toAccountId) formData.set('to_account_id', toAccountId);
    if (categoryId) formData.set('category_id', categoryId);
    
    if (dueDate && (currentType === 'GIVEN' || currentType === 'BORROWED')) {
      formData.set('due_date', format(dueDate, 'yyyy-MM-dd'));
    } else {
      formData.set('due_date', '');
    }
    
    formData.set('transaction_date', format(transactionDate, 'yyyy-MM-dd'));
    
    if (['GIVEN', 'RECEIVED', 'BORROWED', 'RETURNED'].includes(currentType) && !personId) {
      toast.error(t.addTransactionForm.selectPerson);
      setIsLoading(false);
      return;
    }

    if (requiresSingleAccount && !accountId) {
      toast.error(t.addTransactionForm.selectAccount || 'Please select an account');
      setIsLoading(false);
      return;
    }
    
    if (currentType === 'TRANSFER' && (!accountId || !toAccountId)) {
      toast.error('Please select both source and destination accounts');
      setIsLoading(false);
      return;
    }
    
    if (currentType === 'TRANSFER' && accountId === toAccountId) {
      toast.error('Source and destination accounts must be different');
      setIsLoading(false);
      return;
    }

    const result = await updateTransaction(transaction.id, formData);
    
    setIsLoading(false);
    
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success('Transaction updated successfully');
      router.push('/transactions');
    }
  };

  const isLending = ['GIVEN', 'RECEIVED', 'BORROWED', 'RETURNED'].includes(currentType);
  const requiresCategory = ['INCOME', 'EXPENSE'].includes(currentType);
  const requiresSingleAccount = ['INCOME', 'EXPENSE', 'GIVEN', 'RECEIVED', 'BORROWED', 'RETURNED', 'SAVING'].includes(currentType);
  const requiresTwoAccounts = currentType === 'TRANSFER';

  const filteredCategories = categories.filter(c => c.type === currentType);

  return (
    <Card className="glass-panel w-full">
      {showGrid ? (
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {TRANSACTION_TYPES.map(tItem => (
              <button
                key={tItem.id}
                type="button"
                onClick={() => {
                  router.push(`?type=${tItem.id}`);
                }}
                className={cn(
                  "flex flex-col items-center justify-center p-5 sm:p-6 gap-3 sm:gap-4 rounded-xl border glass-panel transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-primary",
                  tItem.bg,
                  tItem.id === currentType && "ring-2 ring-primary bg-primary/5"
                )}
              >
                <div className={cn("p-3 rounded-full bg-background/50", tItem.color)}>
                  <tItem.icon className="h-7 w-7 sm:h-8 sm:w-8" />
                </div>
                <span className="font-medium text-sm text-center leading-tight">{tItem.label}</span>
              </button>
            ))}
          </div>
        </CardContent>
      ) : (
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4 pt-6 pb-6">
            <div className="flex justify-between items-center bg-primary/5 p-4 rounded-xl border border-primary/10 mb-2">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1">{t.common.type}</span>
                <span className="font-medium text-base">{TRANSACTION_TYPES.find(tItem => tItem.id === currentType)?.label}</span>
              </div>
              <Button variant="outline" size="sm" type="button" onClick={() => router.push('?grid=true')} className="glass-panel">
                {t.common.edit} {t.common.type}
              </Button>
            </div>
            <input type="hidden" name="type" value={currentType} />

          {/* PERSON SELECTOR */}
          {isLending && (
            <div className="space-y-2">
              <Label>{t.common.person}</Label>
              <div className="flex gap-2">
                <div className="flex-1">
                  <Select value={personId} onValueChange={(val) => setPersonId(val || '')} required>
                    <SelectTrigger className="w-full glass-panel border-primary/20">
                      {personId ? (
                        <span className="flex flex-1 text-left truncate">
                          {localPeople.find(p => p.id === personId)?.name || 'Unknown'}
                        </span>
                      ) : (
                        <span className="flex flex-1 text-left text-muted-foreground truncate">
                          {t.addTransactionForm.selectPerson}
                        </span>
                      )}
                    </SelectTrigger>
                    <SelectContent className="glass-panel border-primary/20 shadow-2xl">
                      {localPeople.map(person => (
                        <SelectItem key={person.id} value={person.id}>
                          {person.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <AddPersonDialog onSuccess={(person) => {
                  setLocalPeople(prev => [...prev, person].sort((a, b) => a.name.localeCompare(b.name)));
                  setPersonId(person.id);
                }} />
              </div>
            </div>
          )}

          {/* ACCOUNTS SELECTOR */}
          {requiresSingleAccount && (
            <div className="space-y-2">
              <Label>{['INCOME', 'BORROWED', 'RECEIVED'].includes(currentType) ? t.addTransactionForm.toAccount : t.addTransactionForm.fromAccount}</Label>
              <Select value={accountId} onValueChange={(val) => setAccountId(val || '')}>
                <SelectTrigger className="w-full glass-panel border-primary/20">
                  <SelectValue placeholder={t.addTransactionForm.selectAccount}>
                    {accountId ? accounts.find(a => a.id === accountId)?.name : t.addTransactionForm.selectAccount}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="glass-panel border-primary/20 shadow-2xl">
                  {accounts.map(acc => (
                    <SelectItem key={acc.id} value={acc.id}>{acc.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {requiresTwoAccounts && (
            <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] gap-3 items-start">
              <div className="space-y-2">
                <Label>{t.addTransactionForm.source}</Label>
                <Select value={accountId} onValueChange={(val) => setAccountId(val || '')} required>
                  <SelectTrigger className="w-full glass-panel border-primary/20">
                    <SelectValue placeholder={t.addTransactionForm.source}>
                      {accountId ? accounts.find(a => a.id === accountId)?.name : t.addTransactionForm.source}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="glass-panel border-primary/20 shadow-2xl">
                    {accounts.map(acc => (
                      <SelectItem key={acc.id} value={acc.id}>{acc.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-center sm:pt-6 sm:h-[66px]">
                <div className="h-8 w-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-xs">
                  <ArrowRight className="hidden sm:block h-4 w-4" />
                  <ArrowDown className="sm:hidden h-4 w-4" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>{t.addTransactionForm.destination}</Label>
                <Select value={toAccountId} onValueChange={(val) => setToAccountId(val || '')} required>
                  <SelectTrigger className="w-full glass-panel border-primary/20">
                    <SelectValue placeholder={t.addTransactionForm.destination}>
                      {toAccountId ? accounts.find(a => a.id === toAccountId)?.name : t.addTransactionForm.destination}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="glass-panel border-primary/20 shadow-2xl">
                    {accounts.map(acc => (
                      <SelectItem key={acc.id} value={acc.id}>{acc.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* CATEGORY SELECTOR */}
          {requiresCategory && (
            <div className="space-y-2">
              <Label>{t.addTransactionForm.category}</Label>
              <Select value={categoryId} onValueChange={(val) => setCategoryId(val || '')}>
                <SelectTrigger className="w-full glass-panel border-primary/20">
                  <SelectValue placeholder={t.addTransactionForm.selectCategory}>
                    {categoryId ? filteredCategories.find(c => c.id === categoryId)?.name : t.addTransactionForm.selectCategory}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="glass-panel border-primary/20 shadow-2xl">
                  {filteredCategories.map(cat => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* DUE DATE */}
          {(currentType === 'GIVEN' || currentType === 'BORROWED') && (
            <div className="space-y-2 flex flex-col p-4 bg-primary/5 rounded-xl border border-primary/10">
              <Label htmlFor="due_date">{t.addTransactionForm.expectedReturnDate}</Label>
              <Popover>
                <PopoverTrigger render={
                  <Button
                    variant={'outline'}
                    className={cn(
                      'w-full justify-start text-left font-normal glass-panel border-primary/20 bg-background/50',
                      !dueDate && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
                    {dueDate ? format(dueDate, 'PPP') : <span>{t.addTransactionForm.pickDueDate}</span>}
                  </Button>
                } />
                <PopoverContent className="w-auto p-0 glass-panel border-primary/20 shadow-2xl" align="start">
                  <Calendar
                    mode="single"
                    selected={dueDate}
                    onSelect={(newDate) => setDueDate(newDate)}
                    className="rounded-xl"
                  />
                </PopoverContent>
              </Popover>
            </div>
          )}

          {/* RECURRING OPTIONS */}
          {['INCOME', 'EXPENSE'].includes(currentType) && (
            <div className="space-y-2 flex flex-col p-4 bg-primary/5 rounded-xl border border-primary/10">
              <Label>{t.addTransactionForm.recurring}</Label>
              <Select name="recurrence" defaultValue={transaction.recurrence || ""}>
                <SelectTrigger className="w-full glass-panel border-primary/20 bg-background/50">
                  <SelectValue placeholder={t.addTransactionForm.oneTime} />
                </SelectTrigger>
                <SelectContent className="glass-panel border-primary/20 shadow-2xl">
                  <SelectItem value="">{t.addTransactionForm.oneTime}</SelectItem>
                  <SelectItem value="MONTHLY">{t.addTransactionForm.monthly}</SelectItem>
                  <SelectItem value="YEARLY">{t.addTransactionForm.yearly}</SelectItem>
                  <SelectItem value="WEEKLY">{t.addTransactionForm.weekly}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="amount">{t.common.amount} (৳)</Label>
            <Input id="amount" name="amount" type="number" step="0.01" min="0.01" defaultValue={transaction.amount} placeholder="0.00" required className="glass-panel border-primary/20" />
          </div>

          <div className="space-y-2 flex flex-col p-4 bg-primary/5 rounded-xl border border-primary/10">
            <Label htmlFor="transaction_date">{t.common.date}</Label>
            <Popover>
              <PopoverTrigger render={
                <Button
                  variant={'outline'}
                  className={cn(
                    'w-full justify-start text-left font-normal glass-panel border-primary/20 bg-background/50',
                    !transactionDate && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
                  {transactionDate ? format(transactionDate, 'PPP') : <span>{t.addTransactionForm.pickDate}</span>}
                </Button>
              } />
              <PopoverContent className="w-auto p-0 glass-panel border-primary/20 shadow-2xl" align="start">
                <Calendar
                  mode="single"
                  selected={transactionDate}
                  onSelect={(newDate) => newDate && setTransactionDate(newDate)}
                  className="rounded-xl"
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="note">{t.common.note}</Label>
            <Input id="note" name="note" defaultValue={transaction.note || ''} placeholder={t.addTransactionForm.addNotePlaceholder} className="glass-panel border-primary/20" />
          </div>

          <div className="pt-4 flex gap-3">
            <Button variant="outline" type="button" onClick={() => router.back()} className="flex-1 glass-panel">
              {t.common.cancel}
            </Button>
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t.addTransactionForm.saveTransaction}
            </Button>
          </div>
        </CardContent>
      </form>
      )}
    </Card>
  );
}
