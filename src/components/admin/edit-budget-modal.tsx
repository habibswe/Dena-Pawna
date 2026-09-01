'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Edit } from 'lucide-react';
import { updateBudget } from '@/app/super-admin/(dashboard)/actions';
import { toast } from 'sonner';

export function EditBudgetModal({ budget }: { budget: any }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function action(formData: FormData) {
    setLoading(true);
    try {
      await updateBudget(budget.id, formData);
      toast.success('Budget updated successfully');
      setOpen(false);
    } catch (err: any) {
      toast.error(err.message || 'Failed to update budget');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" size="sm" className="glass-panel text-primary border-primary/20" />}>
        <Edit className="h-4 w-4 mr-2" /> Edit
      </DialogTrigger>
      <DialogContent className="glass-panel !bg-background shadow-2xl">
        <DialogHeader>
          <DialogTitle>Edit Budget</DialogTitle>
        </DialogHeader>
        <form action={action} className="space-y-4">
          <div className="space-y-2">
            <Label>Category</Label>
            <Input value={budget.categories?.name || 'Unknown'} disabled className="glass-panel bg-muted/50" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="amount">Budget Amount</Label>
            <Input id="amount" name="amount" type="number" step="0.01" defaultValue={budget.amount} required className="glass-panel" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="month">Month (YYYY-MM)</Label>
            <Input id="month" name="month" type="month" defaultValue={budget.month} required className="glass-panel" />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
