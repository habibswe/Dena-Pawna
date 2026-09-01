'use client';

import * as React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertCircle, Loader2 } from 'lucide-react';
import { useTranslation } from '@/i18n/client';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  description: string;
  isDeleting?: boolean;
  confirmText?: string;
  cancelText?: string;
}

export function ConfirmDialog({ isOpen, onClose, onConfirm, title, description, isDeleting = false, confirmText, cancelText }: ConfirmDialogProps) {
  const { t } = useTranslation();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent showCloseButton={false} className="glass-panel border-destructive/20 sm:max-w-[400px]">
        <DialogHeader className="flex flex-row items-center gap-4 space-y-0">
          <div className="bg-destructive/10 p-3 rounded-full shrink-0">
            <AlertCircle className="w-6 h-6 text-destructive" />
          </div>
          <div className="flex flex-col gap-1">
            <DialogTitle className="text-xl">{title}</DialogTitle>
            <DialogDescription className="text-sm">
              {description}
            </DialogDescription>
          </div>
        </DialogHeader>
        <div className="mt-6 flex justify-end gap-3 w-full">
          <Button variant="outline" onClick={onClose} disabled={isDeleting} className="w-auto">
            {cancelText || t.common.cancel}
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={isDeleting} className="w-auto">
            {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {confirmText || t.common.delete}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
