'use client';

import { useState, useTransition, useEffect } from 'react';
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
  Calendar as CalendarIcon, 
  ArrowLeft, 
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
import { addTransaction } from '@/app/(dashboard)/transactions/actions';
import { AddPersonDialog } from '../people/add-person-dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

const TRANSACTION_TYPES = [
  { id: 'EXPENSE', label: 'Expense', icon: TrendingDown, color: 'text-red-500', bg: 'hover:bg-red-500/10 border-red-500/20' },
  { id: 'INCOME', label: 'Income', icon: TrendingUp, color: 'text-green-500', bg: 'hover:bg-green-500/10 border-green-500/20' },
  { id: 'TRANSFER', label: 'Transfer', icon: ArrowRightLeft, color: 'text-blue-500', bg: 'hover:bg-blue-500/10 border-blue-500/20' },
  { id: 'SAVING', label: 'Saving', icon: PiggyBank, color: 'text-purple-500', bg: 'hover:bg-purple-500/10 border-purple-500/20' },
  { id: 'GIVEN', label: 'Lent (Given)', icon: Send, color: 'text-orange-500', bg: 'hover:bg-orange-500/10 border-orange-500/20' },
  { id: 'RECEIVED', label: 'Repay In', icon: Handshake, color: 'text-emerald-500', bg: 'hover:bg-emerald-500/10 border-emerald-500/20' },
  { id: 'BORROWED', label: 'Borrowed', icon: Download, color: 'text-rose-500', bg: 'hover:bg-rose-500/10 border-rose-500/20' },
  { id: 'RETURNED', label: 'Repay Out', icon: Upload, color: 'text-indigo-500', bg: 'hover:bg-indigo-500/10 border-indigo-500/20' },
];

import { useTranslation } from '@/i18n/client';
import { SkeletonForm, SkeletonHeader } from '@/components/ui/skeletons';
import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';

export function AddTransactionForm({ 
  people, 
  accounts,
  categories,
  defaultPersonId,
  defaultType,
  pageTitle,
  pageDesc,
  backLink
}: { 
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  people: any[], 
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  accounts: any[],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  categories: any[],
  defaultPersonId?: string,
  defaultType?: string,
  pageTitle: string,
  pageDesc: string,
  backLink: string
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
  
  const type = defaultType || '';
  const showGrid = !type;
  
  const [personId, setPersonId] = useState(defaultPersonId || '');
  const [accountId, setAccountId] = useState('');
  const [toAccountId, setToAccountId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  
  const [localPeople, setLocalPeople] = useState(people);
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [transactionDate, setTransactionDate] = useState<Date>(new Date());
  const [isDateOpen, setIsDateOpen] = useState(false);
  const [isDueDateOpen, setIsDueDateOpen] = useState(false);
  const [recurrence, setRecurrence] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    
    formData.set('type', type);
    if (personId) formData.set('person_id', personId);
    if (accountId) formData.set('account_id', accountId);
    if (toAccountId) formData.set('to_account_id', toAccountId);
    if (categoryId) formData.set('category_id', categoryId);
    if (recurrence) formData.set('recurrence', recurrence);
    
    if (dueDate && (type === 'GIVEN' || type === 'BORROWED')) {
      formData.set('due_date', format(dueDate, 'yyyy-MM-dd'));
    }
    
    formData.set('transaction_date', format(transactionDate, 'yyyy-MM-dd'));
    
    if (['GIVEN', 'RECEIVED', 'BORROWED', 'RETURNED'].includes(type) && !personId) {
      toast.error(t.addTransactionForm.selectPerson);
      setIsLoading(false);
      return;
    }

    if (requiresSingleAccount && !accountId) {
      toast.error(t.addTransactionForm.selectAccount || 'Please select an account');
      setIsLoading(false);
      return;
    }
    
    if (['TRANSFER', 'SAVING'].includes(type) && (!accountId || !toAccountId)) {
      toast.error(type === 'SAVING' ? 'উৎস ও সঞ্চয় অ্যাকাউন্ট উভয়ই নির্বাচন করুন' : 'Please select both source and destination accounts');
      setIsLoading(false);
      return;
    }
    
    if (['TRANSFER', 'SAVING'].includes(type) && accountId === toAccountId) {
      toast.error('Source and destination accounts must be different');
      setIsLoading(false);
      return;
    }

    const result = await addTransaction(formData);
    
    setIsLoading(false);
    
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success('Transaction added successfully');
      router.push('/dashboard');
    }
  };

  const [isPending, startTransition] = useTransition();
  const [selectingType, setSelectingType] = useState<string | null>(null);

  useEffect(() => {
    setSelectingType(null);
  }, [defaultType]);

  const handleSelectType = (typeId: string) => {
    setSelectingType(typeId);
    setCategoryId('');
    startTransition(() => {
      router.push(`?type=${typeId}`);
    });
  };

  const isLending = ['GIVEN', 'RECEIVED', 'BORROWED', 'RETURNED'].includes(type);
  const requiresCategory = ['INCOME', 'EXPENSE'].includes(type);
  const requiresSingleAccount = ['INCOME', 'EXPENSE', 'GIVEN', 'RECEIVED', 'BORROWED', 'RETURNED'].includes(type);
  const requiresTwoAccounts = ['TRANSFER', 'SAVING'].includes(type);

  const filteredCategories = categories.filter(c => c.type === type);

  const isSelecting = (selectingType !== null && defaultType !== selectingType) || isPending;

  if (isSelecting) {
    return (
      <div className="space-y-6">
        <SkeletonHeader title subtitle button={false} />
        <SkeletonForm />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        {type && (
          <Link href={backLink} className={cn(buttonVariants({ variant: "default", size: "icon" }), "h-10 w-10 sm:h-12 sm:w-12 shrink-0 rounded-xl")}>
            <ArrowLeft className="h-5 w-5 sm:h-6 sm:w-6" />
          </Link>
        )}
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{pageTitle}</h2>
          <p className="text-muted-foreground">{pageDesc}</p>
        </div>
      </div>
      
      <Card className="glass-panel w-full">
      {showGrid ? (
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {TRANSACTION_TYPES.map(tItem => {
              const isCardSelected = selectingType === tItem.id;
              return (
                <button
                  key={tItem.id}
                  type="button"
                  disabled={!!selectingType}
                  onClick={() => handleSelectType(tItem.id)}
                  className={cn(
                    "flex flex-col items-center justify-center p-5 sm:p-6 gap-3 sm:gap-4 rounded-xl border glass-panel transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-primary relative overflow-hidden",
                    tItem.bg,
                    isCardSelected && "ring-2 ring-primary bg-primary/10 scale-95"
                  )}
                >
                  <div className={cn("p-3 rounded-full bg-background/50", tItem.color)}>
                    <tItem.icon className="h-7 w-7 sm:h-8 sm:w-8" />
                  </div>
                  <span className="font-medium text-sm text-center leading-tight">{tItem.label}</span>
                </button>
              );
            })}
          </div>
        </CardContent>
      ) : (
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4 pb-6">
            <input type="hidden" name="type" value={type} />

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
              <Label>{['INCOME', 'BORROWED', 'RECEIVED'].includes(type) ? t.addTransactionForm.toAccount : t.addTransactionForm.fromAccount}</Label>
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
                <Label>{type === 'SAVING' ? (t.addTransactionForm.fromAccount || 'কোন অ্যাকাউন্ট থেকে (From)') : t.addTransactionForm.source}</Label>
                <Select value={accountId} onValueChange={(val) => setAccountId(val || '')} required>
                  <SelectTrigger className="w-full glass-panel border-primary/20">
                    <SelectValue placeholder={type === 'SAVING' ? (t.addTransactionForm.fromAccount || 'উৎস অ্যাকাউন্ট') : t.addTransactionForm.source}>
                      {accountId ? accounts.find(a => a.id === accountId)?.name : (type === 'SAVING' ? (t.addTransactionForm.fromAccount || 'উৎস অ্যাকাউন্ট') : t.addTransactionForm.source)}
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
                <Label>{type === 'SAVING' ? (t.addTransactionForm.toAccount || 'সঞ্চয় অ্যাকাউন্ট (To)') : t.addTransactionForm.destination}</Label>
                <Select value={toAccountId} onValueChange={(val) => setToAccountId(val || '')} required>
                  <SelectTrigger className="w-full glass-panel border-primary/20">
                    <SelectValue placeholder={type === 'SAVING' ? (t.addTransactionForm.toAccount || 'সঞ্চয় অ্যাকাউন্ট') : t.addTransactionForm.destination}>
                      {toAccountId ? accounts.find(a => a.id === toAccountId)?.name : (type === 'SAVING' ? (t.addTransactionForm.toAccount || 'সঞ্চয় অ্যাকাউন্ট') : t.addTransactionForm.destination)}
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
          {(type === 'GIVEN' || type === 'BORROWED') && (
            <div className="space-y-2 flex flex-col p-4 bg-primary/5 rounded-xl border border-primary/10">
              <Label htmlFor="due_date">{t.addTransactionForm.expectedReturnDate}</Label>
              <Popover open={isDueDateOpen} onOpenChange={setIsDueDateOpen}>
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
                <PopoverContent className="w-auto p-0 glass-panel border-primary/20 shadow-2xl !bg-background" align="start">
                  <Calendar
                    mode="single"
                    selected={dueDate}
                    onSelect={(newDate) => {
                      setDueDate(newDate);
                      setIsDueDateOpen(false);
                    }}
                    className="rounded-xl"
                  />
                </PopoverContent>
              </Popover>
            </div>
          )}

          {/* RECURRING OPTIONS */}
          {['INCOME', 'EXPENSE'].includes(type) && (
            <div className="space-y-2 flex flex-col p-4 bg-primary/5 rounded-xl border border-primary/10">
              <Label>{t.addTransactionForm.recurring}</Label>
              <Select value={recurrence} onValueChange={(val) => val !== null && setRecurrence(val)}>
                <SelectTrigger className="w-full glass-panel border-primary/20 bg-background/50">
                  <SelectValue placeholder={t.addTransactionForm.oneTime}>
                    {recurrence === 'MONTHLY' ? t.addTransactionForm.monthly :
                     recurrence === 'YEARLY' ? t.addTransactionForm.yearly :
                     recurrence === 'WEEKLY' ? t.addTransactionForm.weekly :
                     t.addTransactionForm.oneTime}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="glass-panel border-primary/20 shadow-2xl !bg-background">
                  <SelectItem value="">{t.addTransactionForm.oneTime}</SelectItem>
                  <SelectItem value="WEEKLY">{t.addTransactionForm.weekly}</SelectItem>
                  <SelectItem value="MONTHLY">{t.addTransactionForm.monthly}</SelectItem>
                  <SelectItem value="YEARLY">{t.addTransactionForm.yearly}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="amount">{t.common.amount} (৳)</Label>
            <Input id="amount" name="amount" type="number" step="0.01" min="0.01" placeholder="0.00" required className="glass-panel border-primary/20" />
          </div>

          <div className="space-y-2 flex flex-col p-4 bg-primary/5 rounded-xl border border-primary/10">
            <Label htmlFor="transaction_date">{t.common.date}</Label>
            <Popover open={isDateOpen} onOpenChange={setIsDateOpen}>
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
              <PopoverContent className="w-auto p-0 glass-panel border-primary/20 shadow-2xl !bg-background" align="start">
                <Calendar
                  mode="single"
                  selected={transactionDate}
                  disabled={(date) => date > new Date()}
                  onSelect={(newDate) => {
                    if (newDate) {
                      setTransactionDate(newDate);
                      setIsDateOpen(false);
                    }
                  }}
                  className="rounded-xl"
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="note">{t.common.note}</Label>
            <Input id="note" name="note" placeholder={t.addTransactionForm.addNotePlaceholder} className="glass-panel border-primary/20" />
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
    </div>
  );
}
