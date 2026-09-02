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
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
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
  const [openingBalanceType, setOpeningBalanceType] = useState(person.opening_balance_type || 'NONE');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    formData.set('opening_balance_type', openingBalanceType);
    
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
      <DialogContent className="sm:max-w-[425px] glass-panel border-primary/20 !bg-background shadow-2xl">
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
            <div className="grid grid-cols-1 gap-3.5 p-3.5 rounded-xl border bg-secondary/10">
              <div className="grid gap-1.5">
                <Label htmlFor="opening_balance" className="text-xs font-medium">{t.people.openingBalance}</Label>
                <Input 
                  id="opening_balance" 
                  name="opening_balance" 
                  type="number" 
                  step="any" 
                  min="0" 
                  defaultValue={person.opening_balance || ''}
                  placeholder="৳ 0.00" 
                  className="h-10 text-sm"
                />
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs font-medium">{t.people.openingBalanceType}</Label>
                <Select value={openingBalanceType} onValueChange={(val) => val && setOpeningBalanceType(val)}>
                  <SelectTrigger className="w-full glass-panel border-primary/20 text-sm h-10">
                    <SelectValue placeholder={t.people.openingBalanceType}>
                      {openingBalanceType === 'PAYABLE' 
                        ? t.people.iOweThem 
                        : openingBalanceType === 'RECEIVABLE' 
                          ? t.people.theyOweMe 
                          : t.people.noOpeningBalance}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="!bg-background shadow-2xl">
                    <SelectItem value="NONE">{t.people.noOpeningBalance}</SelectItem>
                    <SelectItem value="PAYABLE" className="text-destructive font-medium">{t.people.iOweThem}</SelectItem>
                    <SelectItem value="RECEIVABLE" className="text-emerald-600 dark:text-emerald-400 font-medium">{t.people.theyOweMe}</SelectItem>
                  </SelectContent>
                </Select>
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
