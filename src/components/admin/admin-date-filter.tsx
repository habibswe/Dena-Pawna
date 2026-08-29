'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';

export function AdminDateFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const [from, setFrom] = useState(searchParams.get('from') || '');
  const [to, setTo] = useState(searchParams.get('to') || '');

  useEffect(() => {
    setFrom(searchParams.get('from') || '');
    setTo(searchParams.get('to') || '');
  }, [searchParams]);

  const applyFilters = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', '1');
    if (from) params.set('from', from);
    else params.delete('from');
    
    if (to) params.set('to', to);
    else params.delete('to');
    
    router.push(`${pathname}?${params.toString()}`);
  };

  const clearFilters = () => {
    setFrom('');
    setTo('');
    const params = new URLSearchParams(searchParams.toString());
    params.delete('from');
    params.delete('to');
    params.set('page', '1');
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex flex-col sm:flex-row items-end gap-2">
      <div className="space-y-1 w-full sm:w-auto">
        <Label className="text-xs text-muted-foreground">From</Label>
        <Input 
          type="date" 
          value={from} 
          onChange={(e) => setFrom(e.target.value)} 
          className="glass-panel"
        />
      </div>
      <div className="space-y-1 w-full sm:w-auto">
        <Label className="text-xs text-muted-foreground">To</Label>
        <Input 
          type="date" 
          value={to} 
          onChange={(e) => setTo(e.target.value)} 
          className="glass-panel"
        />
      </div>
      <div className="flex gap-2 w-full sm:w-auto">
        <Button onClick={applyFilters} className="w-full sm:w-auto">Filter</Button>
        {(from || to) && (
          <Button variant="outline" onClick={clearFilters} className="w-full sm:w-auto glass-panel">Clear</Button>
        )}
      </div>
    </div>
  );
}
