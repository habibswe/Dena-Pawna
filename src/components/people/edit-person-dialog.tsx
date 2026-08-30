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
import { updatePerson } from '@/app/(dashboard)/people/actions';

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
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    
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
      <DialogContent className="sm:max-w-[425px] glass-panel border-primary/20">
        <DialogHeader>
          <DialogTitle>Edit Person</DialogTitle>
          <DialogDescription>
            Update the contact details for this person.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" name="name" defaultValue={person.name} placeholder="e.g. Rahim" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone (Optional)</Label>
              <Input id="phone" name="phone" defaultValue={person.phone || ''} placeholder="+880..." />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email (Optional)</Label>
              <Input id="email" name="email" type="email" defaultValue={person.email || ''} placeholder="rahim@example.com" />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update Person
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
