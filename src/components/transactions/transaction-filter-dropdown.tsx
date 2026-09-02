'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Filter } from 'lucide-react';
import { useTranslation } from '@/i18n/client';

export function TransactionFilterDropdown({ currentFilter }: { currentFilter?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { t } = useTranslation();

  const FILTER_OPTIONS = [
    { value: 'ALL', label: t.transactions.filterAll },
    { value: 'GIVEN', label: t.transactions.filterGiven },
    { value: 'RECEIVED', label: t.transactions.filterReceived },
    { value: 'INCOME', label: t.transactions.filterIncome },
    { value: 'EXPENSE', label: t.transactions.filterExpense },
    { value: 'BORROWED', label: t.transactions.filterBorrowed },
    { value: 'RETURNED', label: t.transactions.filterReturned },
    { value: 'TRANSFER', label: t.transactions.filterTransfer },
    { value: 'SAVING', label: t.transactions.filterSaving },
  ];

  const selectedValue = currentFilter && FILTER_OPTIONS.some(o => o.value === currentFilter) ? currentFilter : 'ALL';

  const handleValueChange = (val: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (val && val !== 'ALL') {
      params.set('filter', val);
    } else {
      params.delete('filter');
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="w-[160px] sm:w-[210px]">
      <Select value={selectedValue} onValueChange={(val) => val && handleValueChange(val)}>
        <SelectTrigger size="default" className="glass-panel text-sm font-medium h-10 border-primary/20 w-full">
          <div className="flex items-center gap-2 truncate">
            <Filter className="h-4 w-4 text-primary shrink-0" />
            <SelectValue placeholder={t.transactions.filterPlaceholder} />
          </div>
        </SelectTrigger>
        <SelectContent className="glass-panel border-primary/20 shadow-2xl min-w-[210px] z-[999]">
          {FILTER_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value} className="text-xs sm:text-sm cursor-pointer">
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
