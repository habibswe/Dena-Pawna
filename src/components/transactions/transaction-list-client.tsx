'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { getPaginatedTransactions } from '@/app/(dashboard)/transactions/actions';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { Loader2, MoreVertical, Edit, Trash2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { deleteTransaction } from '@/app/(dashboard)/transactions/actions';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

export function TransactionListClient({ 
  initialTransactions, 
  totalCount,
  filter,
  month,
  search
}: {
  initialTransactions: any[];
  totalCount: number;
  filter?: string;
  month?: string;
  search?: string;
}) {
  const [transactions, setTransactions] = useState(initialTransactions);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialTransactions.length < totalCount);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const router = useRouter();
  const observerTarget = useRef<HTMLDivElement>(null);

  const handleDelete = async () => {
    if (!deletingId) return;
    setIsDeleting(true);
    const result = await deleteTransaction(deletingId);
    
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Transaction deleted successfully");
      setTransactions(prev => prev.filter(tx => tx.id !== deletingId));
      setDeletingId(null);
      router.refresh();
    }
    setIsDeleting(false);
  };

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    
    const nextPage = page + 1;
    const { data } = await getPaginatedTransactions(nextPage, filter, month, search);
    
    if (data && data.length > 0) {
      setTransactions(prev => {
        const newTransactions = [...prev, ...data];
        if (newTransactions.length >= totalCount) {
          setHasMore(false);
        }
        return newTransactions;
      });
      setPage(nextPage);
    } else {
      setHasMore(false);
    }
    
    setLoading(false);
  }, [page, loading, hasMore, filter, month, search, totalCount]);

  useEffect(() => {
    // Reset state if filters change (initialTransactions will update)
    setTransactions(initialTransactions);
    setPage(1);
    setHasMore(initialTransactions.length < totalCount);
  }, [initialTransactions, totalCount]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [observerTarget, loadMore, hasMore, loading]);

  if (!transactions || transactions.length === 0) {
    return (
      <div className="p-12 text-center text-muted-foreground">
        No transactions found. Start tracking your money today.
      </div>
    );
  }

  return (
    <div className="divide-y">
      {transactions.map(tx => {
        const isTxPositive = tx.type === 'GIVEN' || tx.type === 'RETURNED';
        const txColor = isTxPositive ? 'text-primary' : 'text-destructive';
        const sign = isTxPositive ? '+' : '-';
        
        let actionText = '';
        if (tx.type === 'GIVEN') actionText = 'You gave';
        if (tx.type === 'RECEIVED') actionText = `${tx.people?.name || 'Someone'} paid`;
        if (tx.type === 'BORROWED') actionText = 'You borrowed';
        if (tx.type === 'RETURNED') actionText = 'You returned';

        const isOverdue = tx.due_date ? new Date(tx.due_date) < new Date(new Date().setHours(0, 0, 0, 0)) : false;

        return (
          <div key={tx.id} className="p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center hover:bg-secondary/20 transition-colors">
            <div className="flex items-center gap-4 sm:w-[40%]">
              <Avatar className="h-10 w-10 border border-primary/20 shrink-0">
                <AvatarFallback className="bg-primary/5 text-primary text-sm font-semibold">
                  {(tx.people?.name || '??').substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1 min-w-0 pr-4">
                <p className="font-semibold leading-none truncate">{tx.people?.name || 'Unknown'}</p>
                <p className="text-sm text-muted-foreground truncate">
                  {actionText} • {format(new Date(tx.transaction_date), 'dd MMM yyyy')}
                </p>
              </div>
            </div>
            
            <div className="hidden sm:flex flex-col flex-1 pr-4 min-w-0 justify-center">
              {tx.note && (
                <p className="text-sm text-muted-foreground italic truncate">"{tx.note}"</p>
              )}
              {tx.due_date && (
                <p className={`text-xs mt-1 font-medium ${isOverdue ? 'text-destructive' : 'text-primary'}`}>
                  {isOverdue ? '⚠️ Overdue' : '⏳ Due'}: {format(new Date(tx.due_date), 'dd MMM yyyy')}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between sm:justify-end sm:w-[120px] mt-4 sm:mt-0">
              <div className="sm:hidden flex flex-col flex-1 pr-4 min-w-0 justify-center">
                {tx.note && (
                  <p className="text-sm text-muted-foreground italic truncate">"{tx.note}"</p>
                )}
                {tx.due_date && (
                  <p className={`text-xs mt-1 font-medium ${isOverdue ? 'text-destructive' : 'text-primary'}`}>
                    {isOverdue ? '⚠️ Overdue' : '⏳ Due'}: {format(new Date(tx.due_date), 'dd MMM yyyy')}
                  </p>
                )}
              </div>
              <div className={`font-bold ${txColor} text-lg whitespace-nowrap`}>
                {sign}৳{Number(tx.amount).toLocaleString()}
              </div>
              <div className="ml-2">
                <DropdownMenu>
                  <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="h-8 w-8 -mr-2" />}>
                    <MoreVertical className="h-4 w-4 text-muted-foreground" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => router.push(`/transactions/${tx.id}/edit`)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => setDeletingId(tx.id)}>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        );
      })}
      
      {hasMore && (
        <div ref={observerTarget} className="p-6 flex justify-center items-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      )}

      <ConfirmDialog
        isOpen={!!deletingId}
        onClose={() => !isDeleting && setDeletingId(null)}
        onConfirm={handleDelete}
        title="Delete Transaction?"
        description="Are you sure you want to delete this transaction? This action cannot be undone."
        isDeleting={isDeleting}
      />
    </div>
  );
}
