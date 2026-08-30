'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { addBudget } from '@/app/(dashboard)/budgets/actions';
import { Loader2, Plus, Target } from 'lucide-react';
import { ExpandableFab } from '@/components/ui/expandable-fab';

export function AddBudgetDialog({ 
  categories,
  defaultMonth 
}: { 
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  categories: any[],
  defaultMonth: string
}) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [categoryId, setCategoryId] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      formData.set('category_id', categoryId);
      formData.set('month', defaultMonth);
      
      if (!categoryId) {
        toast.error('Please select a category');
        setIsLoading(false);
        return;
      }

      const result = await addBudget(formData);

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success('Budget saved successfully');
        setOpen(false);
      }
    } catch (error) {
      toast.error('Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <ExpandableFab onClick={() => setOpen(true)} label="Set Budget" />
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger render={
          <Button className="hidden md:flex gap-2">
            <Plus className="h-4 w-4" />
            Set Budget
          </Button>
        } />
        <DialogContent className="sm:max-w-[425px] glass-panel">
        <DialogHeader>
          <DialogTitle>Set Budget</DialogTitle>
          <DialogDescription>
            Create or update a budget for {defaultMonth}.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={categoryId} onValueChange={(val) => setCategoryId(val || '')} required>
              <SelectTrigger>
                <SelectValue placeholder="Select Expense Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(cat => (
                  <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="amount">Monthly Limit (৳)</Label>
            <Input id="amount" name="amount" type="number" step="0.01" min="1" placeholder="e.g. 5000" required />
          </div>

          <div className="pt-4 flex justify-end space-x-2">
            <Button variant="outline" type="button" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Budget
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
    </>
  );
}
