'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { addTransaction } from '@/app/(dashboard)/transactions/actions';
import { AddPersonDialog } from '../people/add-person-dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

export function AddTransactionForm({ 
  people, 
  accounts,
  categories,
  defaultPersonId,
  defaultType 
}: { 
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  people: any[], 
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  accounts: any[],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  categories: any[],
  defaultPersonId?: string,
  defaultType?: string
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [type, setType] = useState(defaultType || 'EXPENSE');
  
  const [personId, setPersonId] = useState(defaultPersonId || '');
  const [accountId, setAccountId] = useState('');
  const [toAccountId, setToAccountId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  
  const [localPeople, setLocalPeople] = useState(people);
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [transactionDate, setTransactionDate] = useState<Date>(new Date());

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    
    // Append the controlled states since Select components might not natively submit well if not using hidden inputs, 
    // or we just inject them here to be safe.
    formData.set('type', type);
    if (personId) formData.set('person_id', personId);
    if (accountId) formData.set('account_id', accountId);
    if (toAccountId) formData.set('to_account_id', toAccountId);
    if (categoryId) formData.set('category_id', categoryId);
    
    if (dueDate && (type === 'GIVEN' || type === 'BORROWED')) {
      formData.set('due_date', format(dueDate, 'yyyy-MM-dd'));
    }
    
    formData.set('transaction_date', format(transactionDate, 'yyyy-MM-dd'));
    
    if (['GIVEN', 'RECEIVED', 'BORROWED', 'RETURNED'].includes(type) && !personId) {
      toast.error('Please select a person');
      setIsLoading(false);
      return;
    }
    
    if (type === 'TRANSFER' && (!accountId || !toAccountId)) {
      toast.error('Please select both source and destination accounts');
      setIsLoading(false);
      return;
    }
    
    if (type === 'TRANSFER' && accountId === toAccountId) {
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

  const isLending = ['GIVEN', 'RECEIVED', 'BORROWED', 'RETURNED'].includes(type);
  const requiresCategory = ['INCOME', 'EXPENSE'].includes(type);
  const requiresSingleAccount = ['INCOME', 'EXPENSE', 'GIVEN', 'RECEIVED', 'BORROWED', 'RETURNED', 'SAVING'].includes(type);
  const requiresTwoAccounts = type === 'TRANSFER';

  const filteredCategories = categories.filter(c => c.type === type);

  return (
    <Card className="glass-panel max-w-lg mx-auto">
      <CardHeader>
        <CardTitle>Add Transaction</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4 pb-6">
          
          {/* TYPE SELECTOR */}
          <div className="space-y-2">
            <Label htmlFor="type">Transaction Type</Label>
            <Select name="type" required value={type} onValueChange={(val) => {
                setType(val || 'EXPENSE');
                setCategoryId(''); // reset category on type change
              }}>
              <SelectTrigger className="w-full glass-panel border-primary/20">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent className="glass-panel border-primary/20 shadow-2xl">
                <SelectItem value="EXPENSE">Expense</SelectItem>
                <SelectItem value="INCOME">Income</SelectItem>
                <SelectItem value="TRANSFER">Transfer</SelectItem>
                <SelectItem value="SAVING">Saving</SelectItem>
                <SelectItem value="GIVEN">I gave money (Lending)</SelectItem>
                <SelectItem value="RECEIVED">I received money (Repayment in)</SelectItem>
                <SelectItem value="BORROWED">I borrowed money (Borrowing)</SelectItem>
                <SelectItem value="RETURNED">I returned money (Repayment out)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* PERSON SELECTOR */}
          {isLending && (
            <div className="space-y-2">
              <Label>Person</Label>
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
                          Select a person
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
              <Label>{['INCOME', 'BORROWED', 'RECEIVED'].includes(type) ? 'To Account' : 'From Account'} (Optional)</Label>
              <Select value={accountId} onValueChange={(val) => setAccountId(val || '')}>
                <SelectTrigger className="w-full glass-panel border-primary/20">
                  <SelectValue placeholder="Select Account">
                    {accountId ? accounts.find(a => a.id === accountId)?.name : 'Select Account'}
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
            <div className="grid grid-cols-[1fr_auto_1fr] gap-2 items-end">
              <div className="space-y-2">
                <Label>From</Label>
                <Select value={accountId} onValueChange={(val) => setAccountId(val || '')} required>
                  <SelectTrigger className="glass-panel border-primary/20">
                    <SelectValue placeholder="Source">
                      {accountId ? accounts.find(a => a.id === accountId)?.name : 'Source'}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map(acc => (
                      <SelectItem key={acc.id} value={acc.id}>{acc.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="pb-2">
                <ArrowRight className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <Label>To</Label>
                <Select value={toAccountId} onValueChange={(val) => setToAccountId(val || '')} required>
                  <SelectTrigger className="glass-panel border-primary/20">
                    <SelectValue placeholder="Destination">
                      {toAccountId ? accounts.find(a => a.id === toAccountId)?.name : 'Destination'}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
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
              <Label>Category</Label>
              <Select value={categoryId} onValueChange={(val) => setCategoryId(val || '')}>
                <SelectTrigger className="w-full glass-panel border-primary/20">
                  <SelectValue placeholder="Select category (Optional)">
                    {categoryId ? filteredCategories.find(c => c.id === categoryId)?.name : 'Select category (Optional)'}
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
              <Label htmlFor="due_date">Expected Return Date (Optional)</Label>
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
                    {dueDate ? format(dueDate, 'PPP') : <span>Pick a due date</span>}
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
          {['INCOME', 'EXPENSE'].includes(type) && (
            <div className="space-y-2 flex flex-col p-4 bg-primary/5 rounded-xl border border-primary/10">
              <Label>Recurring Transaction (Optional)</Label>
              <Select name="recurrence" defaultValue="">
                <SelectTrigger className="w-full glass-panel border-primary/20 bg-background/50">
                  <SelectValue placeholder="One-time (Not recurring)" />
                </SelectTrigger>
                <SelectContent className="glass-panel border-primary/20 shadow-2xl">
                  <SelectItem value="">One-time (Not recurring)</SelectItem>
                  <SelectItem value="MONTHLY">Monthly</SelectItem>
                  <SelectItem value="YEARLY">Yearly</SelectItem>
                  <SelectItem value="WEEKLY">Weekly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="amount">Amount (৳)</Label>
            <Input id="amount" name="amount" type="number" step="0.01" min="0.01" placeholder="0.00" required className="glass-panel border-primary/20" />
          </div>

          <div className="space-y-2 flex flex-col p-4 bg-primary/5 rounded-xl border border-primary/10">
            <Label htmlFor="transaction_date">Date</Label>
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
                  {transactionDate ? format(transactionDate, 'PPP') : <span>Pick a date</span>}
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
            <Label htmlFor="note">Note (Optional)</Label>
            <Input id="note" name="note" placeholder="Add a short note" className="glass-panel border-primary/20" />
          </div>

          <div className="pt-4 flex gap-3">
            <Button variant="outline" type="button" onClick={() => router.back()} className="flex-1 glass-panel">
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="flex-1 shadow-lg hover:shadow-xl transition-all">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Transaction
            </Button>
          </div>
        </CardContent>
      </form>
    </Card>
  );
}
