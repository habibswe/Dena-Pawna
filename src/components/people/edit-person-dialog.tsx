'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { updatePerson } from '@/app/(dashboard)/people/actions';

import { useTranslation } from '@/i18n/client';

export function EditPersonDialog({ 
  person, 
  open, 
  onOpenChange 
}: { 
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  person: any; 
  open: boolean; 
  onOpenChange: (open: boolean) => void;
}) {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    
    const result = await updatePerson(person.id, formData);
    
    setIsLoading(false);
    
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success('Person updated successfully');
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] glass-panel border-primary/20">
        <DialogHeader>
          <DialogTitle>{t.common.edit} {t.people.title}</DialogTitle>
          <DialogDescription>
            {t.people.addPersonDesc}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">{t.people.fullName}</Label>
              <Input id="name" name="name" defaultValue={person.name} placeholder={t.people.fullNamePlaceholder} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">{t.people.phoneOptional}</Label>
              <Input id="phone" name="phone" defaultValue={person.phone || ''} placeholder="+880..." />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">{t.people.emailOptional}</Label>
              <Input id="email" name="email" type="email" defaultValue={person.email || ''} placeholder="rahim@example.com" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-xl border bg-secondary/10">
              <div className="grid gap-1.5">
                <Label htmlFor="opening_balance" className="text-xs">{t.people.openingBalance}</Label>
                <Input 
                  id="opening_balance" 
                  name="opening_balance" 
                  type="number" 
                  step="any" 
                  min="0" 
                  defaultValue={person.opening_balance || ''}
                  placeholder="৳ 0.00" 
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="opening_balance_type" className="text-xs">{t.people.openingBalanceType}</Label>
                <select
                  id="opening_balance_type"
                  name="opening_balance_type"
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  defaultValue={person.opening_balance_type || 'NONE'}
                >
                  <option value="NONE" className="bg-background text-foreground">{t.people.noOpeningBalance}</option>
                  <option value="PAYABLE" className="bg-background text-destructive font-medium">{t.people.iOweThem}</option>
                  <option value="RECEIVABLE" className="bg-background text-emerald-600 dark:text-emerald-400 font-medium">{t.people.theyOweMe}</option>
                </select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t.common.save}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
