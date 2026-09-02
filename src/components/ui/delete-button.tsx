'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

import { useTranslation } from '@/i18n/client';

export function DeleteButton({ 
  onDelete, 
  itemType = 'Item'
}: { 
  onDelete: () => Promise<{ error?: string, success?: boolean }>, 
  itemType?: string
}) {
  const { t } = useTranslation();
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
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : `Failed to delete ${itemType.toLowerCase()}`;
      toast.error(msg);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Button variant="destructive" size="sm" onClick={() => setIsOpen(true)} disabled={isDeleting}>
        {isDeleting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Trash2 className="h-4 w-4 mr-2" />} 
        {t.common.delete}
      </Button>

      <ConfirmDialog
        isOpen={isOpen}
        onClose={() => !isDeleting && setIsOpen(false)}
        onConfirm={handleDelete}
        title={t.common.confirmDelete}
        description={t.common.confirmDeleteDesc}
        isDeleting={isDeleting}
      />
    </>
  );
}
