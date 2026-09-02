'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { updateAccount } from '@/app/(dashboard)/accounts/actions';
import { Loader2 } from 'lucide-react';
import React from 'react';
import { useTranslation } from '@/i18n/client';
import { fetchActiveAccountTypes, AccountTypeItem, DEFAULT_ACCOUNT_TYPES } from '@/lib/account-types';

export function EditAccountDialog({ 
  account, 
  open, 
  onOpenChange 
}: { 
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  account: any; 
  open: boolean; 
  onOpenChange: (open: boolean) => void;
}) {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [accountTypes, setAccountTypes] = useState<AccountTypeItem[]>(DEFAULT_ACCOUNT_TYPES);

  useEffect(() => {
    if (open) {
      fetchActiveAccountTypes().then(setAccountTypes);
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      const result = await updateAccount(account.id, formData);

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success('Account updated successfully');
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
          <DialogTitle>{t.common.edit} {t.accounts.title}</DialogTitle>
          <DialogDescription>
            {t.accounts.addAccountDesc}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="name">{t.accounts.accountName}</Label>
            <Input id="name" name="name" defaultValue={account.name} placeholder={t.accounts.accountNamePlaceholder} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="type">{t.accounts.accountType}</Label>
            <Select name="type" required defaultValue={account.type}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent className="glass-panel !bg-background">
                {accountTypes.map((at) => (
                  <SelectItem key={at.code} value={at.code}>
                    {at.name}
                  </SelectItem>
                ))}
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
