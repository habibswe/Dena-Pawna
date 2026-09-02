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

import { useTranslation } from '@/i18n/client';

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
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [isDefault, setIsDefault] = useState(budget?.is_default ?? false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      formData.set('is_default', isDefault ? 'true' : 'false');
      
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
      <DialogContent className="sm:max-w-[425px] glass-panel !bg-background shadow-2xl">
        <DialogHeader>
          <DialogTitle>{t.common.edit} {t.budgets.title}</DialogTitle>
          <DialogDescription>
            {budget.categories?.name}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label>{t.categories.title}</Label>
            <Input disabled value={budget.categories?.name || 'Unknown'} className="bg-muted/50 text-muted-foreground glass-panel border-primary/20" />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="amount">{t.budgets.monthlyLimit}</Label>
            <Input id="amount" name="amount" type="number" step="0.01" min="1" defaultValue={budget.amount} required className="glass-panel border-primary/20" />
          </div>

          <label 
            htmlFor="edit_is_default"
            className="flex items-start space-x-3 p-3 rounded-xl bg-primary/5 border border-primary/10 cursor-pointer hover:bg-primary/10 transition-colors select-none"
          >
            <input 
              type="checkbox" 
              id="edit_is_default" 
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
