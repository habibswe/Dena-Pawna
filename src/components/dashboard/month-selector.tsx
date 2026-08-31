'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, Filter, X } from 'lucide-react';
import { format, parse, addMonths, subMonths } from 'date-fns';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { DateRange } from 'react-day-picker';

export function MonthSelector({ currentMonth, from, to }: { currentMonth?: string, from?: string, to?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isCustomDateOpen, setIsCustomDateOpen] = useState(false);
  
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: from ? new Date(from) : undefined,
    to: to ? new Date(to) : undefined,
  });

  const isAllTime = currentMonth === 'all';
  const hasCustomRange = !!from || !!to;
  
  // currentMonth is in YYYY-MM format, default to today if not provided and not in special states
  const activeMonth = (!currentMonth && !hasCustomRange) ? format(new Date(), 'yyyy-MM') : (currentMonth && currentMonth !== 'all' ? currentMonth : format(new Date(), 'yyyy-MM'));
  const date = parse(activeMonth, 'yyyy-MM', new Date());

  const handlePrev = () => {
    const prev = format(subMonths(date, 1), 'yyyy-MM');
    updateQuery({ month: prev, from: null, to: null });
  };

  const handleNext = () => {
    const next = format(addMonths(date, 1), 'yyyy-MM');
    updateQuery({ month: next, from: null, to: null });
  };

  const isCurrentMonth = activeMonth === format(new Date(), 'yyyy-MM');

  const handleReset = () => {
    updateQuery({ month: format(new Date(), 'yyyy-MM'), from: null, to: null });
  }

  const handleAllTime = () => {
    updateQuery({ month: 'all', from: null, to: null });
  }

  const updateQuery = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });
    
    router.push(`?${params.toString()}`);
  };

  // Determine what text to show in the center
  let displayText = format(date, 'MMMM yyyy');
  let shortText = format(date, 'MMM yyyy');
  let Icon = CalendarIcon;
  
  if (isAllTime) {
    displayText = "All Time";
    shortText = "All Time";
    Icon = Clock;
  } else if (hasCustomRange) {
    const fromStr = from ? format(new Date(from), 'MMM d, yy') : 'Start';
    const toStr = to ? format(new Date(to), 'MMM d, yy') : 'End';
    displayText = `${fromStr} - ${toStr}`;
    shortText = displayText;
    Icon = Filter;
  }

  return (
    <>
      <div className="flex items-center gap-1 sm:gap-2">
        {/* Main Navigation Pill */}
        <div className="flex items-center gap-1 sm:gap-2 bg-background/50 border rounded-full p-0.5 sm:p-1 shadow-sm glass-panel w-fit shrink-0">
          {(!isAllTime && !hasCustomRange) && (
            <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-9 sm:w-9 rounded-full shrink-0" onClick={handlePrev}>
              <ChevronLeft className="h-5 w-5 text-muted-foreground" />
            </Button>
          )}
          
          <div 
            className={cn(
              "flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 text-xs sm:text-sm font-medium whitespace-nowrap justify-center transition-colors h-8 sm:h-9",
              (!isCurrentMonth && !isAllTime && !hasCustomRange) ? "cursor-pointer hover:text-primary" : (isAllTime || hasCustomRange) ? "text-primary" : ""
            )} 
            onClick={(!isAllTime && !hasCustomRange && !isCurrentMonth) ? handleReset : undefined}
          >
            <Icon className={cn("h-4 w-4 shrink-0 hidden sm:block", (isAllTime || hasCustomRange) ? "text-primary" : "text-muted-foreground")} />
            <span className="hidden sm:inline font-semibold">{displayText}</span>
            <span className="sm:hidden tracking-tight font-semibold">{shortText}</span>
          </div>
          
          {(!isAllTime && !hasCustomRange) && (
            <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-9 sm:w-9 rounded-full shrink-0" onClick={handleNext}>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </Button>
          )}

          {(isAllTime || hasCustomRange) && (
            <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-9 sm:w-9 rounded-full shrink-0 text-muted-foreground hover:text-destructive" onClick={handleReset}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Filter Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger render={
            <Button variant="outline" size="icon" className="h-10 w-10 sm:h-11 sm:w-11 rounded-full glass-panel shadow-sm shrink-0 border-primary/20 hover:bg-primary/5">
              <Filter className="h-5 w-5 text-primary" />
            </Button>
          } />
          <DropdownMenuContent align="end" className="w-56 p-2 rounded-xl glass-panel shadow-xl">
            <DropdownMenuItem onClick={handleAllTime} className="cursor-pointer font-medium p-3 rounded-lg">
              <Clock className="mr-2 h-4 w-4 text-primary" />
              <span>Lifetime (All Time)</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setIsCustomDateOpen(true)} className="cursor-pointer font-medium p-3 rounded-lg">
              <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
              <span>Custom Date Range...</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Dialog open={isCustomDateOpen} onOpenChange={setIsCustomDateOpen}>
        <DialogContent className="sm:max-w-[425px] !bg-background shadow-2xl glass-panel">
          <DialogHeader>
            <DialogTitle>Custom Date Range</DialogTitle>
            <DialogDescription>
              Select a specific start and end date to filter your transactions.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 flex justify-center">
            <Calendar
              mode="range"
              defaultMonth={dateRange?.from || new Date()}
              selected={dateRange}
              onSelect={setDateRange}
              numberOfMonths={1}
              className="rounded-xl border shadow-sm"
              captionLayout="dropdown"
              startMonth={new Date(2022, 0)}
              endMonth={new Date(new Date().getFullYear() + 5, 11)}
            />
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setDateRange(undefined)}>Clear</Button>
            <Button onClick={() => {
              if (dateRange?.from) {
                updateQuery({
                  month: null,
                  from: format(dateRange.from, 'yyyy-MM-dd'),
                  to: dateRange.to ? format(dateRange.to, 'yyyy-MM-dd') : null
                });
              } else {
                updateQuery({ month: null, from: null, to: null });
              }
              setIsCustomDateOpen(false);
            }}>Apply</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
