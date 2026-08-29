'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export function DeleteButton({ 
  onDelete, 
  itemType = 'Item'
}: { 
  onDelete: () => Promise<{ error?: string, success?: boolean }>, 
  itemType?: string
}) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete this ${itemType.toLowerCase()}?`)) return;
    
    setIsDeleting(true);
    try {
      const res = await onDelete();
      if (res?.error) {
        toast.error(res.error);
      } else {
        toast.success(`${itemType} deleted successfully!`);
        router.refresh();
      }
    } catch (e: any) {
      toast.error(e.message || `Failed to delete ${itemType.toLowerCase()}`);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Button variant="destructive" size="sm" onClick={handleDelete} disabled={isDeleting}>
      {isDeleting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Trash2 className="h-4 w-4 mr-2" />} 
      Delete
    </Button>
  );
}
