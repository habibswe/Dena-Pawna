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
import { addPerson } from '@/app/(dashboard)/people/actions';
import { ExpandableFab } from '@/components/ui/expandable-fab';

export function AddPersonDialog({ children, onSuccess }: { children?: React.ReactElement, onSuccess?: (person: any) => void }) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    
    const result = await addPerson(formData);
    
    setIsLoading(false);
    
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success('Person added successfully');
      setOpen(false);
      if (onSuccess && result.data) onSuccess(result.data);
    }
  };

  return (
    <>
      {!children && <ExpandableFab onClick={() => setOpen(true)} label="Add Person" />}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger render={
          children || (
            <Button className="hidden md:flex gap-2">
              <Plus className="h-4 w-4" /> Add Person
            </Button>
          )
        } />
      <DialogContent className="sm:max-w-[425px] glass-panel border-primary/20">
        <DialogHeader>
          <DialogTitle>Add Person</DialogTitle>
          <DialogDescription>
            Add someone to start tracking money with them.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" name="name" placeholder="e.g. Rahim" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone (Optional)</Label>
              <Input id="phone" name="phone" placeholder="+880..." />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email (Optional)</Label>
              <Input id="email" name="email" type="email" placeholder="rahim@example.com" />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Person
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
    </>
  );
}
