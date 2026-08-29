'use client';

import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useCallback, useState, useEffect } from 'react';

export function AdminSearch({ placeholder = 'Search...' }: { placeholder?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentSearch = searchParams.get('search') || '';
  
  const [value, setValue] = useState(currentSearch);

  useEffect(() => {
    setValue(currentSearch);
  }, [currentSearch]);

  const handleSearch = useCallback((term: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', '1'); // reset page on search
    if (term) {
      params.set('search', term);
    } else {
      params.delete('search');
    }
    router.push(`${pathname}?${params.toString()}`);
  }, [pathname, router, searchParams]);

  // Debounce effect
  useEffect(() => {
    const timer = setTimeout(() => {
      if (value !== currentSearch) {
        handleSearch(value);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [value, handleSearch, currentSearch]);

  return (
    <div className="relative w-full sm:max-w-xs">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className="h-4 w-4 text-muted-foreground" />
      </div>
      <Input
        type="search"
        placeholder={placeholder}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="pl-9 glass-panel"
      />
    </div>
  );
}
