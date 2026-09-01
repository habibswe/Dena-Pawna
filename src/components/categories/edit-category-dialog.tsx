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

import { useTranslation } from '@/i18n/client';

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
  const { t } = useTranslation();
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
          <DialogTitle>{t.common.edit} {t.categories.title}</DialogTitle>
          <DialogDescription>
            {t.categories.addCategoryDesc}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="name">{t.categories.categoryName}</Label>
            <Input id="name" name="name" defaultValue={category.name} placeholder={t.categories.categoryNamePlaceholder} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="type">{t.categories.categoryType}</Label>
            <Select name="type" required defaultValue={category.type}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="EXPENSE">{t.dashboard.expenses}</SelectItem>
                <SelectItem value="INCOME">{t.dashboard.income}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="pt-4 flex justify-end space-x-2">
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
              {t.common.cancel}
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t.common.save}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
