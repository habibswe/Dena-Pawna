'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { addCategory } from '@/app/(dashboard)/categories/actions';
import { Loader2, Plus } from 'lucide-react';
import { ExpandableFab } from '@/components/ui/expandable-fab';

import { useTranslation } from '@/i18n/client';

export function AddCategoryDialog() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      const result = await addCategory(formData);

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success('Category added successfully');
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
      <ExpandableFab onClick={() => setOpen(true)} label={t.categories.addCategory} />
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger render={
          <Button className="hidden md:flex gap-2">
            <Plus className="h-4 w-4" />
            {t.categories.addCategory}
          </Button>
        } />
        <DialogContent className="sm:max-w-[425px] glass-panel">
        <DialogHeader>
          <DialogTitle>{t.categories.addCategory}</DialogTitle>
          <DialogDescription>
            {t.categories.addCategoryDesc}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="name">{t.categories.categoryName}</Label>
            <Input id="name" name="name" placeholder={t.categories.categoryNamePlaceholder} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="type">{t.categories.categoryType}</Label>
            <Select name="type" required defaultValue="EXPENSE">
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
            <Button variant="outline" type="button" onClick={() => setOpen(false)}>
              {t.common.cancel}
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t.categories.saveCategory}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
    </>
  );
}
