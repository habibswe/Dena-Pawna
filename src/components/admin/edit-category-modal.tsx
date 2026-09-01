'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Edit } from 'lucide-react';
import { updateCategory } from '@/app/super-admin/(dashboard)/actions';
import { toast } from 'sonner';

export function EditCategoryModal({ category }: { category: any }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function action(formData: FormData) {
    setLoading(true);
    try {
      await updateCategory(category.id, formData);
      toast.success('Category updated successfully');
      setOpen(false);
    } catch (err: any) {
      toast.error(err.message || 'Failed to update category');
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
          <DialogTitle>Edit Category</DialogTitle>
        </DialogHeader>
        <form action={action} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Category Name</Label>
            <Input id="name" name="name" defaultValue={category.name} required className="glass-panel" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="type">Transaction Type</Label>
            <Select name="type" defaultValue={category.type}>
              <SelectTrigger className="glass-panel">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent className="glass-panel">
                <SelectItem value="EXPENSE">Expense</SelectItem>
                <SelectItem value="INCOME">Income</SelectItem>
                <SelectItem value="TRANSFER">Transfer</SelectItem>
                <SelectItem value="GIVEN">Given</SelectItem>
                <SelectItem value="RECEIVED">Received</SelectItem>
                <SelectItem value="BORROWED">Borrowed</SelectItem>
                <SelectItem value="RETURNED">Returned</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="icon">Icon Name (lucide-react)</Label>
            <Input id="icon" name="icon" defaultValue={category.icon} required className="glass-panel" />
          </div>
          {category.is_budget && (
            <div className="space-y-2">
              <Label htmlFor="budget_limit">Monthly Budget Limit</Label>
              <Input id="budget_limit" name="budget_limit" type="number" step="0.01" defaultValue={category.budget_limit || ''} className="glass-panel" />
            </div>
          )}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
