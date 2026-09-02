'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Edit } from 'lucide-react';
import { updateAccountType } from '@/app/super-admin/(dashboard)/account-types/actions';
import { toast } from 'sonner';

export function EditAccountTypeModal({ item }: { item: any }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function action(formData: FormData) {
    setLoading(true);
    try {
      const res = await updateAccountType(item.id, formData);
      if (res?.error) {
        toast.error(res.error);
      } else {
        toast.success('Account type updated successfully');
        setOpen(false);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to update account type');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={
        <Button variant="outline" size="sm" className="glass-panel text-primary border-primary/20">
          <Edit className="h-4 w-4 mr-2" /> Edit
        </Button>
      } />
      <DialogContent className="glass-panel !bg-background shadow-2xl">
        <DialogHeader>
          <DialogTitle>Edit Account Type</DialogTitle>
        </DialogHeader>
        <form action={action} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Display Name</Label>
            <Input id="name" name="name" defaultValue={item.name} required className="glass-panel" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="code">System Code</Label>
            <Input id="code" name="code" defaultValue={item.code} required className="glass-panel uppercase" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="icon">Icon Name (Lucide Icon)</Label>
            <Input id="icon" name="icon" defaultValue={item.icon || 'CreditCard'} required className="glass-panel" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="is_active">Status</Label>
            <Select name="is_active" defaultValue={item.is_active !== false ? 'true' : 'false'}>
              <SelectTrigger className="glass-panel">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent className="glass-panel !bg-background">
                <SelectItem value="true">Active</SelectItem>
                <SelectItem value="false">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" className="w-full mt-4" disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
