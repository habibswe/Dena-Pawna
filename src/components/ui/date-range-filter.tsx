'use client';

import * as React from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, X } from 'lucide-react';
import { DateRange } from 'react-day-picker';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

export function DateRangeFilter({
  className,
}: React.HTMLAttributes<HTMLDivElement>) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const fromParam = searchParams.get('from');
  const toParam = searchParams.get('to');

  const [date, setDate] = React.useState<DateRange | undefined>({
    from: fromParam ? new Date(fromParam) : undefined,
    to: toParam ? new Date(toParam) : undefined,
  });

  // Sync state if URL changes externally
  React.useEffect(() => {
    setDate({
      from: searchParams.get('from') ? new Date(searchParams.get('from')!) : undefined,
      to: searchParams.get('to') ? new Date(searchParams.get('to')!) : undefined,
    });
  }, [searchParams]);

  const applyUrl = () => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (date?.from) {
      params.set('from', format(date.from, 'yyyy-MM-dd'));
    } else {
      params.delete('from');
    }
    
    if (date?.to) {
      params.set('to', format(date.to, 'yyyy-MM-dd'));
    } else {
      params.delete('to');
    }

    params.delete('filter');
    
    if (params.has('page')) {
      params.set('page', '1');
    }

    router.push(`${pathname}?${params.toString()}`);
  };

  const clearUrl = () => {
    setDate(undefined);
    const params = new URLSearchParams(searchParams.toString());
    params.delete('from');
    params.delete('to');
    params.delete('filter');
    if (params.has('page')) {
      params.set('page', '1');
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className={cn('flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto', className)}>
      <Popover>
        <PopoverTrigger render={
          <Button
            id="date"
            variant={'outline'}
            className={cn(
              'w-full sm:w-[260px] justify-start text-left font-normal glass-panel border-primary/20 hover:bg-primary/5',
              !date && 'text-muted-foreground'
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4 text-primary flex-shrink-0" />
            <span className="truncate">
              {date?.from ? (
                date.to ? (
                  <>
                    {format(date.from, 'LLL dd, y')} -{' '}
                    {format(date.to, 'LLL dd, y')}
                  </>
                ) : (
                  format(date.from, 'LLL dd, y')
                )
              ) : (
                <span>Filter by Date Range</span>
              )}
            </span>
          </Button>
        } />
        <PopoverContent className="w-auto p-0 glass-panel border-primary/20 shadow-2xl" align="start">
          <Calendar
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={setDate}
            numberOfMonths={1}
            className="rounded-xl"
          />
        </PopoverContent>
      </Popover>

      <div className="flex gap-2 w-full sm:w-auto">
        <Button onClick={applyUrl} className="flex-1 sm:flex-none">Apply</Button>
        {(fromParam || toParam || date?.from || date?.to) ? (
          <Button variant="outline" onClick={clearUrl} className="flex-1 sm:flex-none glass-panel px-3">
            <X className="h-4 w-4 sm:mr-1" />
            <span className="inline sm:hidden">Clear</span>
            <span className="hidden sm:inline">Clear</span>
          </Button>
        ) : null}
      </div>
    </div>
  );
}
