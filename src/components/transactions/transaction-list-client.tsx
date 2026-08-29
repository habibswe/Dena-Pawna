'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { getPaginatedTransactions } from '@/app/(dashboard)/transactions/actions';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { Loader2 } from 'lucide-react';

export function TransactionListClient({ 
  initialTransactions, 
  totalCount,
  filter,
  from,
  to,
  search
}: {
  initialTransactions: any[];
  totalCount: number;
  filter?: string;
  from?: string;
  to?: string;
  search?: string;
}) {
  const [transactions, setTransactions] = useState(initialTransactions);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialTransactions.length < totalCount);
  
  const observerTarget = useRef<HTMLDivElement>(null);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    
    const nextPage = page + 1;
    const { data } = await getPaginatedTransactions(nextPage, filter, from, to, search);
    
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
  }, [page, loading, hasMore, filter, from, to, search, totalCount]);

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
            
            <div className="hidden sm:block flex-1 pr-4 min-w-0">
              {tx.note && (
                <p className="text-sm text-muted-foreground italic truncate">"{tx.note}"</p>
              )}
            </div>

            <div className="flex items-center justify-between sm:justify-end sm:w-[120px] mt-4 sm:mt-0">
              <div className="sm:hidden flex-1 pr-4 min-w-0">
                {tx.note && (
                  <p className="text-sm text-muted-foreground italic truncate">"{tx.note}"</p>
                )}
              </div>
              <div className={`font-bold ${txColor} text-lg whitespace-nowrap`}>
                {sign}৳{Number(tx.amount).toLocaleString()}
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
    </div>
  );
}
