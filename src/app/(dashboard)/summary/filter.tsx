'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function SummaryFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [from, setFrom] = useState(searchParams.get('from') || '');
  const [to, setTo] = useState(searchParams.get('to') || '');

  const applyFilter = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (from) params.set('from', from);
    else params.delete('from');
    
    if (to) params.set('to', to);
    else params.delete('to');

    // Remove old filter param if it exists
    params.delete('filter');

    router.push(`/summary?${params.toString()}`);
  };

  const clearFilter = () => {
    setFrom('');
    setTo('');
    router.push('/summary');
  };

  return (
    <div className="flex flex-col sm:flex-row items-end gap-3">
      <div className="space-y-1 w-full sm:w-auto">
        <Label htmlFor="from-date" className="text-xs text-muted-foreground">From Date</Label>
        <Input 
          id="from-date"
          type="date" 
          value={from} 
          onChange={(e) => setFrom(e.target.value)}
          className="w-full sm:w-[150px] bg-background/50"
        />
      </div>
      <div className="space-y-1 w-full sm:w-auto">
        <Label htmlFor="to-date" className="text-xs text-muted-foreground">To Date</Label>
        <Input 
          id="to-date"
          type="date" 
          value={to} 
          onChange={(e) => setTo(e.target.value)}
          className="w-full sm:w-[150px] bg-background/50"
        />
      </div>
      <div className="flex gap-2 w-full sm:w-auto">
        <Button onClick={applyFilter} className="flex-1 sm:flex-none">Apply</Button>
        {(from || to) && (
          <Button variant="outline" onClick={clearFilter} className="flex-1 sm:flex-none">Clear</Button>
        )}
      </div>
    </div>
  );
}
