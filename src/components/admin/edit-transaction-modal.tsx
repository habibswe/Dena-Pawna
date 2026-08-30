'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Edit } from 'lucide-react';
import { updateTransaction } from '@/app/super-admin/(dashboard)/actions';
import { toast } from 'sonner';

export function EditTransactionModal({ transaction }: { transaction: any }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function action(formData: FormData) {
    setLoading(true);
    try {
      await updateTransaction(transaction.id, formData);
      toast.success('Transaction updated successfully');
      setOpen(false);
    } catch (err: any) {
      toast.error(err.message || 'Failed to update transaction');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" size="sm" className="glass-panel text-primary border-primary/20" />}>
        <Edit className="h-4 w-4 mr-2" /> Edit
      </DialogTrigger>
      <DialogContent className="glass-panel">
        <DialogHeader>
          <DialogTitle>Edit Transaction</DialogTitle>
        </DialogHeader>
        <form action={action} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="type">Transaction Type</Label>
            <Select name="type" defaultValue={transaction.type}>
              <SelectTrigger className="glass-panel">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent className="glass-panel">
                <SelectItem value="GIVEN">You Given</SelectItem>
                <SelectItem value="RECEIVED">You Received</SelectItem>
                <SelectItem value="BORROWED">You Borrowed</SelectItem>
                <SelectItem value="RETURNED">You Returned</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input id="amount" name="amount" type="number" step="0.01" defaultValue={transaction.amount} required className="glass-panel" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="transaction_date">Date</Label>
            <Input id="transaction_date" name="transaction_date" type="date" defaultValue={transaction.transaction_date ? transaction.transaction_date.split('T')[0] : ''} required className="glass-panel" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="note">Note</Label>
            <Input id="note" name="note" defaultValue={transaction.note || ''} className="glass-panel" />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
