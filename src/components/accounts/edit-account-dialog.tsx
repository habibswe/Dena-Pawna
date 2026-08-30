'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { updateAccount } from '@/app/(dashboard)/accounts/actions';
import { Loader2 } from 'lucide-react';
import React from 'react';

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
  const [isLoading, setIsLoading] = useState(false);

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
      <DialogContent className="sm:max-w-[425px] glass-panel">
        <DialogHeader>
          <DialogTitle>Edit Account</DialogTitle>
          <DialogDescription>
            Update the details of this account.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Account Name</Label>
            <Input id="name" name="name" defaultValue={account.name} placeholder="e.g., BRAC Bank, Personal bKash" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="type">Account Type</Label>
            <Select name="type" required defaultValue={account.type}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CASH">Cash</SelectItem>
                <SelectItem value="BANK">Bank</SelectItem>
                <SelectItem value="BKASH">bKash</SelectItem>
                <SelectItem value="NAGAD">Nagad</SelectItem>
                <SelectItem value="CARD">Credit/Debit Card</SelectItem>
                <SelectItem value="SAVINGS">Savings</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="pt-4 flex justify-end space-x-2">
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update Account
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
