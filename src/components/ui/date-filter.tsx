'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function DateFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const [from, setFrom] = useState(searchParams.get('from') || '');
  const [to, setTo] = useState(searchParams.get('to') || '');

  const applyFilter = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (from) params.set('from', from);
    else params.delete('from');
    
    if (to) params.set('to', to);
    else params.delete('to');

    router.push(`${pathname}?${params.toString()}`);
  };

  const clearFilter = () => {
    setFrom('');
    setTo('');
    const params = new URLSearchParams(searchParams.toString());
    params.delete('from');
    params.delete('to');
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex flex-row items-end gap-2 w-full sm:w-auto">
      <div className="space-y-1 flex-1">
        <Label htmlFor="from-date" className="text-[10px] sm:text-xs text-muted-foreground uppercase font-medium">From</Label>
        <Input 
          id="from-date"
          type="date" 
          value={from} 
          onChange={(e) => setFrom(e.target.value)}
          className="w-full bg-background/50 text-xs px-2 h-8"
        />
      </div>
      <div className="space-y-1 flex-1">
        <Label htmlFor="to-date" className="text-[10px] sm:text-xs text-muted-foreground uppercase font-medium">To</Label>
        <Input 
          id="to-date"
          type="date" 
          value={to} 
          onChange={(e) => setTo(e.target.value)}
          className="w-full bg-background/50 text-xs px-2 h-8"
        />
      </div>
      <div className="flex gap-1">
        <Button onClick={applyFilter} size="sm" className="h-8 px-3 text-xs">Apply</Button>
        {(from || to) && (
          <Button variant="outline" size="sm" onClick={clearFilter} className="h-8 px-2 text-xs">✕</Button>
        )}
      </div>
    </div>
  );
}
