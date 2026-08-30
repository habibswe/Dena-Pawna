'use client';

import { Button } from '@/components/ui/button';
import { Edit } from 'lucide-react';
import { useState } from 'react';
import { EditPersonDialog } from './edit-person-dialog';

export function EditPersonButton({ person }: { person: any }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <Edit className="mr-2 h-4 w-4" /> Edit
      </Button>
      {open && (
        <EditPersonDialog 
          person={person} 
          open={open} 
          onOpenChange={setOpen} 
        />
      )}
    </>
  );
}
