'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Edit } from 'lucide-react';
import { updateSystemUser } from '@/app/admin/(dashboard)/actions';
import { toast } from 'sonner';

export function EditUserModal({ user }: { user: any }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function action(formData: FormData) {
    setLoading(true);
    try {
      await updateSystemUser(user.id, formData);
      toast.success('System user updated successfully');
      setOpen(false);
    } catch (err: any) {
      toast.error(err.message || 'Failed to update system user');
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
          <DialogTitle>Edit System User</DialogTitle>
          <DialogDescription>Update user details or assign a new password.</DialogDescription>
        </DialogHeader>
        <form action={action} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input id="email" defaultValue={user.email} disabled className="glass-panel opacity-50 cursor-not-allowed" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input id="fullName" name="fullName" defaultValue={user.profile?.full_name || ''} required className="glass-panel" />
          </div>
          <div className="space-y-2 pt-2 border-t">
            <Label htmlFor="password">Reset Password (Optional)</Label>
            <Input id="password" name="password" type="password" placeholder="Leave blank to keep current password" minLength={6} className="glass-panel" />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
