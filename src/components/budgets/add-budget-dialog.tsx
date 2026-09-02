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

import { useTranslation } from '@/i18n/client';

export function AddBudgetDialog({ 
  categories,
  defaultMonth 
}: { 
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  categories: any[],
  defaultMonth: string
}) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [categoryId, setCategoryId] = useState('');
  const [isDefault, setIsDefault] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      formData.set('category_id', categoryId);
      formData.set('month', defaultMonth);
      formData.set('is_default', isDefault ? 'true' : 'false');
      
      if (!categoryId) {
        toast.error(t.budgets.selectCategory);
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
      <ExpandableFab onClick={() => setOpen(true)} label={t.budgets.addBudget} />
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger render={
          <Button className="hidden md:flex gap-2">
            <Plus className="h-4 w-4" />
            {t.budgets.addBudget}
          </Button>
        } />
        <DialogContent className="sm:max-w-[425px] glass-panel !bg-background shadow-2xl">
        <DialogHeader>
          <DialogTitle>{t.budgets.addBudget}</DialogTitle>
          <DialogDescription>
            {t.budgets.addBudgetDesc} ({defaultMonth})
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label>{t.categories.title}</Label>
            <Select value={categoryId} onValueChange={(val) => setCategoryId(val || '')} required>
              <SelectTrigger className="glass-panel border-primary/20">
                <SelectValue placeholder={t.budgets.selectCategory}>
                  {categoryId ? categories.find(c => c.id === categoryId)?.name : t.budgets.selectCategory}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="glass-panel border-primary/20 shadow-2xl">
                {categories.map(cat => (
                  <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="amount">{t.budgets.monthlyLimit}</Label>
            <Input id="amount" name="amount" type="number" step="0.01" min="1" placeholder="e.g. 5000" required className="glass-panel border-primary/20" />
          </div>

          <label 
            htmlFor="is_default"
            className="flex items-start space-x-3 p-3 rounded-xl bg-primary/5 border border-primary/10 cursor-pointer hover:bg-primary/10 transition-colors select-none"
          >
            <input 
              type="checkbox" 
              id="is_default" 
              checked={isDefault} 
              onChange={(e) => setIsDefault(e.target.checked)}
              className="h-4 w-4 mt-0.5 rounded border-primary/20 text-primary accent-primary cursor-pointer" 
            />
            <div className="space-y-0.5">
              <span className="text-sm font-medium block text-foreground">
                {t.budgets.setAsDefault}
              </span>
              <p className="text-xs text-muted-foreground">
                {t.budgets.setAsDefaultDesc}
              </p>
            </div>
          </label>

          <div className="pt-4 flex justify-end space-x-2">
            <Button variant="outline" type="button" onClick={() => setOpen(false)}>
              {t.common.cancel}
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t.budgets.saveBudget}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
    </>
  );
}
