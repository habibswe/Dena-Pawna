'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
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
  defaultPersonId 
}: { 
  people: any[], 
  defaultPersonId?: string 
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [personId, setPersonId] = useState(defaultPersonId || '');
  const [localPeople, setLocalPeople] = useState(people);
  const [date, setDate] = useState<Date>(new Date());

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    formData.set('person_id', personId);
    
    if (!personId) {
      toast.error('Please select a person');
      setIsLoading(false);
      return;
    }

    const result = await addTransaction(formData);
    
    setIsLoading(false);
    
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success('Transaction added successfully');
      router.push(`/people/${personId}`);
    }
  };



  return (
    <Card className="glass-panel max-w-lg mx-auto">
      <CardHeader>
        <CardTitle>Add Transaction</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4 pb-6">
          
          <div className="space-y-2">
            <Label>Person</Label>
            <div className="flex gap-2">
              <div className="flex-1">
                <Select value={personId} onValueChange={(val) => setPersonId(val || '')} required>
                  <SelectTrigger className="w-full glass-panel border-primary/20">
                    {personId ? (
                      <span className="flex flex-1 text-left truncate">
                        {localPeople.find(p => p.id === personId)?.name || 'Unknown Person'}
                      </span>
                    ) : (
                      <span className="flex flex-1 text-left text-muted-foreground truncate">
                        Select a person
                      </span>
                    )}
                  </SelectTrigger>
                  <SelectContent className="glass-panel border-primary/20 shadow-2xl">
                    {localPeople.map(person => (
                      <SelectItem key={person.id} value={person.id} className="hover:bg-primary/5 focus:bg-primary/10">
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

          <div className="space-y-2">
            <Label htmlFor="type">Transaction Type</Label>
            <Select name="type" required defaultValue="GIVEN">
              <SelectTrigger className="w-full glass-panel border-primary/20">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent className="glass-panel border-primary/20 shadow-2xl">
                <SelectItem value="GIVEN" className="hover:bg-primary/5 focus:bg-primary/10">I gave money (They owe me)</SelectItem>
                <SelectItem value="RECEIVED" className="hover:bg-primary/5 focus:bg-primary/10">I received money (They paid me)</SelectItem>
                <SelectItem value="BORROWED" className="hover:bg-primary/5 focus:bg-primary/10">I borrowed money (I owe them)</SelectItem>
                <SelectItem value="RETURNED" className="hover:bg-primary/5 focus:bg-primary/10">I returned money (I paid them)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount (৳)</Label>
            <Input id="amount" name="amount" type="number" step="0.01" min="0.01" placeholder="0.00" required className="glass-panel border-primary/20" />
          </div>

          <div className="space-y-2 flex flex-col">
            <Label htmlFor="transaction_date">Date</Label>
            <input type="hidden" name="transaction_date" value={format(date, 'yyyy-MM-dd')} />
            <Popover>
              <PopoverTrigger render={
                <Button
                  variant={'outline'}
                  className={cn(
                    'w-full justify-start text-left font-normal glass-panel border-primary/20',
                    !date && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
                  {date ? format(date, 'PPP') : <span>Pick a date</span>}
                </Button>
              } />
              <PopoverContent className="w-auto p-0 glass-panel border-primary/20 shadow-2xl" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(newDate) => { if (newDate) setDate(newDate) }}
                  className="rounded-xl"
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="note">Note (Optional)</Label>
            <Input id="note" name="note" type="text" placeholder="e.g. Dinner split" className="glass-panel border-primary/20" />
          </div>

        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Transaction
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
