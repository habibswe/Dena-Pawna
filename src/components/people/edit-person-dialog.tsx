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

import { useTranslation } from '@/i18n/client';

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
  const { t } = useTranslation();
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
          <DialogTitle>{t.common.edit} {t.people.title}</DialogTitle>
          <DialogDescription>
            {t.people.addPersonDesc}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">{t.people.fullName}</Label>
              <Input id="name" name="name" defaultValue={person.name} placeholder={t.people.fullNamePlaceholder} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">{t.people.phoneOptional}</Label>
              <Input id="phone" name="phone" defaultValue={person.phone || ''} placeholder="+880..." />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">{t.people.emailOptional}</Label>
              <Input id="email" name="email" type="email" defaultValue={person.email || ''} placeholder="rahim@example.com" />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t.common.save}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
