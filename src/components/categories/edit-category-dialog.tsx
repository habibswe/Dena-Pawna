'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { updateCategory } from '@/app/(dashboard)/categories/actions';
import { Loader2 } from 'lucide-react';
import React from 'react';

export function EditCategoryDialog({ 
  category, 
  open, 
  onOpenChange 
}: { 
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  category: any; 
  open: boolean; 
  onOpenChange: (open: boolean) => void;
}) {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      const result = await updateCategory(category.id, formData);

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success('Category updated successfully');
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
          <DialogTitle>Edit Category</DialogTitle>
          <DialogDescription>
            Update the details of this category.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Category Name</Label>
            <Input id="name" name="name" defaultValue={category.name} placeholder="e.g., Food, Salary, Rent" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <Select name="type" required defaultValue={category.type}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="EXPENSE">Expense</SelectItem>
                <SelectItem value="INCOME">Income</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="icon">Icon Name (Optional)</Label>
            <Input id="icon" name="icon" defaultValue={category.icon || ''} placeholder="e.g., Coffee, ShoppingCart" />
            <p className="text-xs text-muted-foreground">Uses Lucide-react icon names.</p>
          </div>
          <div className="pt-4 flex justify-end space-x-2">
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update Category
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
