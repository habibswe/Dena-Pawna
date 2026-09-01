'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Filter } from 'lucide-react';

export interface FilterOption {
  label: string;
  value: string;
}

interface AdminFilterDropdownProps {
  paramName: string;
  options: FilterOption[];
  placeholder?: string;
}

export function AdminFilterDropdown({ paramName, options, placeholder = 'Filter' }: AdminFilterDropdownProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentValue = searchParams.get(paramName) || 'ALL';

  const handleValueChange = (val: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', '1'); // reset pagination

    if (val && val !== 'ALL') {
      params.set(paramName, val);
    } else {
      params.delete(paramName);
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="w-[160px] sm:w-[200px]">
      <Select value={currentValue} onValueChange={handleValueChange}>
        <SelectTrigger size="default" className="glass-panel text-sm font-medium h-10 w-full">
          <div className="flex items-center gap-2 truncate">
            <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
            <SelectValue placeholder={placeholder} />
          </div>
        </SelectTrigger>
        <SelectContent className="glass-panel shadow-2xl min-w-[200px] z-[999]">
          <SelectItem value="ALL" className="font-semibold text-muted-foreground">All {placeholder}</SelectItem>
          {options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value} className="text-sm cursor-pointer">
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
