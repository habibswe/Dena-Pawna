'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

export function DeleteButton({ 
  onDelete, 
  itemType = 'Item'
}: { 
  onDelete: () => Promise<{ error?: string, success?: boolean }>, 
  itemType?: string
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await onDelete();
      if (res?.error) {
        toast.error(res.error);
      } else {
        toast.success(`${itemType} deleted successfully!`);
        setIsOpen(false);
        router.refresh();
      }
    } catch (e: any) {
      toast.error(e.message || `Failed to delete ${itemType.toLowerCase()}`);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Button variant="destructive" size="sm" onClick={() => setIsOpen(true)} disabled={isDeleting}>
        {isDeleting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Trash2 className="h-4 w-4 mr-2" />} 
        Delete
      </Button>

      <ConfirmDialog
        isOpen={isOpen}
        onClose={() => !isDeleting && setIsOpen(false)}
        onConfirm={handleDelete}
        title="Are you absolutely sure?"
        description={`This action cannot be undone. This will permanently delete this ${itemType.toLowerCase()}.`}
        isDeleting={isDeleting}
      />
    </>
  );
}
