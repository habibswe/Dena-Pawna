'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { format, parse, addMonths, subMonths } from 'date-fns';

export function MonthSelector({ currentMonth }: { currentMonth: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // currentMonth is in YYYY-MM format
  const date = parse(currentMonth, 'yyyy-MM', new Date());

  const handlePrev = () => {
    const prev = format(subMonths(date, 1), 'yyyy-MM');
    updateQuery(prev);
  };

  const handleNext = () => {
    const next = format(addMonths(date, 1), 'yyyy-MM');
    updateQuery(next);
  };
  
  const handleCurrent = () => {
    const current = format(new Date(), 'yyyy-MM');
    updateQuery(current);
  }

  const updateQuery = (monthStr: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('month', monthStr);
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-2 bg-background/50 border rounded-full p-1 shadow-sm glass-panel w-fit">
      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={handlePrev}>
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <div className="flex items-center gap-2 px-2 text-sm font-medium min-w-[140px] whitespace-nowrap justify-center cursor-pointer hover:text-primary transition-colors" onClick={handleCurrent}>
        <CalendarIcon className="h-4 w-4 shrink-0" />
        <span>{format(date, 'MMMM yyyy')}</span>
      </div>
      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={handleNext}>
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
