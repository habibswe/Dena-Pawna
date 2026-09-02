'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { createAccountType } from '@/app/super-admin/(dashboard)/account-types/actions';
import { toast } from 'sonner';

export function CreateAccountTypeModal() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function action(formData: FormData) {
    setLoading(true);
    try {
      const res = await createAccountType(formData);
      if (res?.error) {
        toast.error(res.error);
      } else {
        toast.success('Account type created successfully');
        setOpen(false);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to create account type');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={
        <Button className="gap-2">
          <Plus className="h-4 w-4" /> Add Account Type
        </Button>
      } />
      <DialogContent className="glass-panel !bg-background shadow-2xl">
        <DialogHeader>
          <DialogTitle>Add New Account Type</DialogTitle>
        </DialogHeader>
        <form action={action} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Display Name</Label>
            <Input id="name" name="name" placeholder="e.g. Rocket, Upay, Crypto" required className="glass-panel" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="code">System Code (Auto-generated if blank)</Label>
            <Input id="code" name="code" placeholder="e.g. ROCKET, UPAY" className="glass-panel uppercase" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="icon">Icon Name (Lucide Icon)</Label>
            <Input id="icon" name="icon" defaultValue="CreditCard" placeholder="e.g. Smartphone, Building2, Wallet" required className="glass-panel" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="is_active">Status</Label>
            <Select name="is_active" defaultValue="true">
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
            {loading ? 'Creating...' : 'Create Account Type'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
