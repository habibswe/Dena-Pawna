'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { updateAccount } from '@/app/(dashboard)/accounts/actions';
import { Loader2, Calendar as CalendarIcon } from 'lucide-react';
import React from 'react';
import { useTranslation } from '@/i18n/client';
import { fetchActiveAccountTypes, AccountTypeItem, DEFAULT_ACCOUNT_TYPES } from '@/lib/account-types';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';

export function EditAccountDialog({ 
  account, 
  accounts = [],
  open, 
  onOpenChange 
}: { 
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  account: any; 
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  accounts?: any[];
  open: boolean; 
  onOpenChange: (open: boolean) => void;
}) {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [accountTypes, setAccountTypes] = useState<AccountTypeItem[]>(DEFAULT_ACCOUNT_TYPES);
  const [selectedType, setSelectedType] = useState<string>(account.type || 'BANK');
  const [recurrence, setRecurrence] = useState<string>(account.recurrence || '');
  const [recurringMode, setRecurringMode] = useState<string>(account.recurring_mode || 'REMINDER_ONLY');
  const [sourceAccountId, setSourceAccountId] = useState<string>(account.source_account_id || '');
  const [maturityDate, setMaturityDate] = useState<Date | undefined>(
    account.maturity_date ? parseISO(account.maturity_date) : undefined
  );
  const [isMaturityOpen, setIsMaturityOpen] = useState(false);

  useEffect(() => {
    if (open) {
      fetchActiveAccountTypes().then(setAccountTypes);
      setSelectedType(account.type || 'BANK');
      setRecurrence(account.recurrence || '');
      setRecurringMode(account.recurring_mode || 'REMINDER_ONLY');
      setSourceAccountId(account.source_account_id || '');
      setMaturityDate(account.maturity_date ? parseISO(account.maturity_date) : undefined);
    }
  }, [open, account]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      formData.set('type', selectedType);
      if (maturityDate) {
        formData.set('maturity_date', format(maturityDate, 'yyyy-MM-dd'));
      } else {
        formData.set('maturity_date', '');
      }
      if (recurrence) {
        formData.set('recurrence', recurrence);
        formData.set('recurring_mode', recurringMode);
        if (recurringMode === 'AUTO_CREATE' && sourceAccountId) {
          formData.set('source_account_id', sourceAccountId);
        } else {
          formData.set('source_account_id', '');
        }
      } else {
        formData.set('recurrence', '');
        formData.set('recurring_mode', '');
        formData.set('source_account_id', '');
      }

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

  const isDPS = selectedType === 'DPS';
  const isFDR = selectedType === 'FDR';
  const isSavings = selectedType === 'SAVINGS';
  const isRegular = !isDPS && !isFDR && !isSavings;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] glass-panel !bg-background shadow-2xl max-h-[90vh] overflow-y-auto">
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
            <Select value={selectedType} onValueChange={(val) => val && setSelectedType(val)} required>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent className="glass-panel !bg-background max-h-56">
                {accountTypes.map((at) => (
                  <SelectItem key={at.code} value={at.code}>
                    {at.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 1. FDR (Fixed Deposit - Maturity Date only) */}
          {isFDR && (
            <div className="p-4 rounded-xl border border-blue-500/20 bg-blue-500/5 space-y-3.5 mt-2">
              <div className="font-semibold text-xs tracking-wide text-blue-600 dark:text-blue-400 uppercase">
                {(t.accounts as any)?.fdrDetails || 'FDR Deposit Details'}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="maturity_date" className="text-xs">{(t.accounts as any)?.maturityDate || 'Maturity Date'}</Label>
                <Popover open={isMaturityOpen} onOpenChange={setIsMaturityOpen}>
                  <PopoverTrigger render={
                    <Button
                      type="button"
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left font-normal h-9 text-xs glass-panel border-blue-500/20 bg-background/50',
                        !maturityDate && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-1.5 h-3.5 w-3.5 text-blue-500" />
                      {maturityDate ? format(maturityDate, 'PP') : <span>Select date</span>}
                    </Button>
                  } />
                  <PopoverContent className="w-auto p-0 glass-panel border-blue-500/20 shadow-2xl !bg-background" align="start">
                    <Calendar
                      mode="single"
                      selected={maturityDate}
                      onSelect={(newDate) => {
                        setMaturityDate(newDate);
                        setIsMaturityOpen(false);
                      }}
                      className="rounded-xl"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          )}

          {/* 2. DPS (Deposit Pension Scheme - Installments, Goal, Maturity, Auto-Create) */}
          {isDPS && (
            <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 space-y-3.5 mt-2">
              <div className="font-semibold text-xs tracking-wide text-primary uppercase">
                {(t.accounts as any)?.dpsDetails || 'DPS Goal & Installment Settings'}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="target_amount" className="text-xs">{(t.accounts as any)?.targetAmount || 'Target Goal (৳)'}</Label>
                  <Input 
                    id="target_amount" 
                    name="target_amount" 
                    type="number" 
                    step="any"
                    defaultValue={account.target_amount || ''}
                    placeholder={(t.accounts as any)?.targetAmountPlaceholder || 'e.g. 300000'} 
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="maturity_date" className="text-xs">{(t.accounts as any)?.maturityDate || 'Maturity Date'}</Label>
                  <Popover open={isMaturityOpen} onOpenChange={setIsMaturityOpen}>
                    <PopoverTrigger render={
                      <Button
                        type="button"
                        variant="outline"
                        className={cn(
                          'w-full justify-start text-left font-normal h-9 text-xs glass-panel border-primary/20 bg-background/50',
                          !maturityDate && 'text-muted-foreground'
                        )}
                      >
                        <CalendarIcon className="mr-1.5 h-3.5 w-3.5 text-primary" />
                        {maturityDate ? format(maturityDate, 'PP') : <span>Select date</span>}
                      </Button>
                    } />
                    <PopoverContent className="w-auto p-0 glass-panel border-primary/20 shadow-2xl !bg-background" align="start">
                      <Calendar
                        mode="single"
                        selected={maturityDate}
                        onSelect={(newDate) => {
                          setMaturityDate(newDate);
                          setIsMaturityOpen(false);
                        }}
                        className="rounded-xl"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="monthly_installment" className="text-xs">{(t.accounts as any)?.installmentAmount || 'Installment (৳)'}</Label>
                  <Input 
                    id="monthly_installment" 
                    name="monthly_installment" 
                    type="number" 
                    step="any"
                    defaultValue={account.monthly_installment || ''}
                    placeholder={(t.accounts as any)?.installmentAmountPlaceholder || 'e.g. 5000'} 
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">{(t.accounts as any)?.frequency || 'Frequency'}</Label>
                  <Select value={recurrence} onValueChange={(val) => setRecurrence(val || '')}>
                    <SelectTrigger className="w-full h-9 text-xs">
                      <SelectValue placeholder="Monthly" />
                    </SelectTrigger>
                    <SelectContent className="glass-panel !bg-background">
                      <SelectItem value="MONTHLY">{(t.accounts as any)?.monthly || 'Monthly'}</SelectItem>
                      <SelectItem value="WEEKLY">{(t.accounts as any)?.weekly || 'Weekly'}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-3 pt-2 border-t border-primary/10">
                <div className="space-y-1.5">
                  <Label className="text-xs">{(t.accounts as any)?.recurringMode || 'Installment Mode'}</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      type="button"
                      variant={recurringMode === 'REMINDER_ONLY' ? 'default' : 'outline'}
                      size="sm"
                      className="text-xs w-full"
                      onClick={() => setRecurringMode('REMINDER_ONLY')}
                    >
                      {(t.accounts as any)?.reminderOnly || 'Reminder Only 🔔'}
                    </Button>
                    <Button
                      type="button"
                      variant={recurringMode === 'AUTO_CREATE' ? 'default' : 'outline'}
                      size="sm"
                      className="text-xs w-full"
                      onClick={() => setRecurringMode('AUTO_CREATE')}
                    >
                      {(t.accounts as any)?.autoCreate || 'Auto Create ⚡'}
                    </Button>
                  </div>
                </div>

                {recurringMode === 'AUTO_CREATE' && (
                  <div className="space-y-1.5">
                    <Label className="text-xs">{(t.accounts as any)?.sourceAccount || 'Source Wallet (Auto-Deposit)'}</Label>
                    <Select value={sourceAccountId} onValueChange={(val) => val && setSourceAccountId(val)}>
                      <SelectTrigger className="w-full h-9 text-xs">
                        <SelectValue placeholder={(t.accounts as any)?.selectSourceAccount || 'Select source wallet'}>
                          {sourceAccountId ? accounts.find(a => a.id === sourceAccountId)?.name : ((t.accounts as any)?.selectSourceAccount || 'Select source wallet')}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent className="glass-panel !bg-background">
                        {accounts.filter(a => a.id !== account.id && a.type !== 'DPS' && a.type !== 'FDR').map((acc) => (
                          <SelectItem key={acc.id} value={acc.id}>
                            {acc.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 3. SAVINGS (Flexible Savings Goal) */}
          {isSavings && (
            <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 space-y-3.5 mt-2">
              <div className="font-semibold text-xs tracking-wide text-emerald-600 dark:text-emerald-400 uppercase">
                {(t.accounts as any)?.savingsDetails || 'Savings Goal Settings (Optional)'}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="target_amount" className="text-xs">{(t.accounts as any)?.targetAmount || 'Target Goal (৳)'}</Label>
                  <Input 
                    id="target_amount" 
                    name="target_amount" 
                    type="number" 
                    step="any"
                    defaultValue={account.target_amount || ''}
                    placeholder={(t.accounts as any)?.targetAmountPlaceholder || 'e.g. 100000'} 
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="maturity_date" className="text-xs">Target Date</Label>
                  <Popover open={isMaturityOpen} onOpenChange={setIsMaturityOpen}>
                    <PopoverTrigger render={
                      <Button
                        type="button"
                        variant="outline"
                        className={cn(
                          'w-full justify-start text-left font-normal h-9 text-xs glass-panel border-emerald-500/20 bg-background/50',
                          !maturityDate && 'text-muted-foreground'
                        )}
                      >
                        <CalendarIcon className="mr-1.5 h-3.5 w-3.5 text-emerald-500" />
                        {maturityDate ? format(maturityDate, 'PP') : <span>Select date</span>}
                      </Button>
                    } />
                    <PopoverContent className="w-auto p-0 glass-panel border-emerald-500/20 shadow-2xl !bg-background" align="start">
                      <Calendar
                        mode="single"
                        selected={maturityDate}
                        onSelect={(newDate) => {
                          setMaturityDate(newDate);
                          setIsMaturityOpen(false);
                        }}
                        className="rounded-xl"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>
          )}

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
