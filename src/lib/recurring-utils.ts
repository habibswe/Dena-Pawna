import { addDays, addWeeks, addMonths, addYears, format, parseISO } from 'date-fns';

export function calculateNextRecurringDate(baseDateStr: string, recurrence: string): string {
  try {
    const date = parseISO(baseDateStr);
    let nextDate: Date;

    switch (recurrence) {
      case 'DAILY':
        nextDate = addDays(date, 1);
        break;
      case 'WEEKLY':
        nextDate = addWeeks(date, 1);
        break;
      case 'MONTHLY':
        nextDate = addMonths(date, 1);
        break;
      case 'YEARLY':
        nextDate = addYears(date, 1);
        break;
      default:
        nextDate = addMonths(date, 1);
    }

    return format(nextDate, 'yyyy-MM-dd');
  } catch (e) {
    console.error('Error calculating next recurring date:', e);
    return baseDateStr;
  }
}
