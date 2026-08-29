'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { UserPlus } from 'lucide-react';
import { createSystemUser } from '@/app/admin/(dashboard)/actions';
import { toast } from 'sonner';

export function CreateUserModal() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function action(formData: FormData) {
    setLoading(true);
    try {
      await createSystemUser(formData);
      toast.success('System user created successfully');
      setOpen(false);
    } catch (err: any) {
      toast.error(err.message || 'Failed to create system user');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button className="glass-panel" />}>
        <UserPlus className="h-4 w-4 mr-2" /> New User
      </DialogTrigger>
      <DialogContent className="glass-panel">
        <DialogHeader>
          <DialogTitle>Create System User</DialogTitle>
          <DialogDescription>Create a new account that can log into the application.</DialogDescription>
        </DialogHeader>
        <form action={action} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input id="email" name="email" type="email" required placeholder="user@example.com" className="glass-panel" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input id="fullName" name="fullName" required placeholder="John Doe" className="glass-panel" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Initial Password</Label>
            <Input id="password" name="password" type="password" required placeholder="Min 6 characters" minLength={6} className="glass-panel" />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Creating...' : 'Create User'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
