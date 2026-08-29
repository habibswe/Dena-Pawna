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

  const today = format(new Date(), 'yyyy-MM-dd');

  return (
    <Card className="glass-panel max-w-lg mx-auto">
      <CardHeader>
        <CardTitle>Add Transaction</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          
          <div className="space-y-2">
            <Label>Person</Label>
            <div className="flex gap-2">
              <div className="flex-1">
                <Select value={personId} onValueChange={(val) => setPersonId(val || '')} required>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a person" />
                  </SelectTrigger>
                  <SelectContent>
                    {localPeople.map(person => (
                      <SelectItem key={person.id} value={person.id}>{person.name}</SelectItem>
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
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="GIVEN">I gave money (They owe me)</SelectItem>
                <SelectItem value="RECEIVED">I received money (They paid me)</SelectItem>
                <SelectItem value="BORROWED">I borrowed money (I owe them)</SelectItem>
                <SelectItem value="RETURNED">I returned money (I paid them)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount (৳)</Label>
            <Input id="amount" name="amount" type="number" step="0.01" min="0.01" placeholder="0.00" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="transaction_date">Date</Label>
            <Input id="transaction_date" name="transaction_date" type="date" defaultValue={today} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="note">Note (Optional)</Label>
            <Input id="note" name="note" type="text" placeholder="e.g. Dinner split" />
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
