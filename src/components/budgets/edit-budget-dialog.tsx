'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { updateBudget } from '@/app/(dashboard)/budgets/actions';
import { Loader2 } from 'lucide-react';

export function EditBudgetDialog({ 
  budget,
  open,
  onOpenChange
}: { 
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  budget: any,
  open: boolean,
  onOpenChange: (open: boolean) => void
}) {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      
      const result = await updateBudget(budget.id, formData);

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success('Budget updated successfully');
        onOpenChange(false);
      }
    } catch (error) {
      toast.error('Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] glass-panel">
        <DialogHeader>
          <DialogTitle>Edit Budget</DialogTitle>
          <DialogDescription>
            Update the budget limit for {budget.categories?.name}.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label>Category</Label>
            <Input disabled value={budget.categories?.name || 'Unknown'} className="bg-muted/50 text-muted-foreground" />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="amount">Monthly Limit (৳)</Label>
            <Input id="amount" name="amount" type="number" step="0.01" min="1" defaultValue={budget.amount} required />
          </div>

          <div className="pt-4 flex justify-end space-x-2">
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update Budget
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
