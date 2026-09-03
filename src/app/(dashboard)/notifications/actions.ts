'use server';

import { createClient } from '@/lib/supabase/server';
import { processDueRecurringTransactions } from '../transactions/recurring-actions';

export async function getPendingNotifications() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { data: [], error: 'Unauthorized' };
  }

  // First, auto-process any AUTO_CREATE recurring transactions that are due today
  await processDueRecurringTransactions();

  // Get current date string in YYYY-MM-DD
  const today = new Date().toISOString().split('T')[0];

  // 1. Fetch Debt/Loan notifications (GIVEN / BORROWED with due_date <= today)
  const { data: debtNotifications, error: debtError } = await supabase
    .from('transactions')
    .select('id, type, amount, due_date, people(name)')
    .eq('user_id', user.id)
    .lte('due_date', today)
    .in('type', ['GIVEN', 'BORROWED'])
    .order('due_date', { ascending: true });

  if (debtError) {
    console.error("Error fetching debt notifications:", debtError);
  }

  // 2. Fetch Due Recurring Reminders (REMINDER_ONLY with next_recurring_date <= today)
  const { data: recurringNotifications, error: recError } = await supabase
    .from('transactions')
    .select('id, type, amount, note, recurrence, next_recurring_date, categories(name), accounts(name)')
    .eq('user_id', user.id)
    .eq('is_recurring', true)
    .eq('recurring_mode', 'REMINDER_ONLY')
    .lte('next_recurring_date', today)
    .order('next_recurring_date', { ascending: true });

  if (recError) {
    console.error("Error fetching recurring notifications:", recError);
  }

  const items = [
    ...(debtNotifications || []).map(item => ({
      ...item,
      isRecurringReminder: false,
    })),
    ...(recurringNotifications || []).map(item => ({
      id: item.id,
      type: item.type,
      amount: item.amount,
      due_date: item.next_recurring_date,
      note: item.note,
      recurrence: item.recurrence,
      categoryName: Array.isArray(item.categories) ? (item.categories[0] as any)?.name : (item.categories as any)?.name,
      accountName: Array.isArray(item.accounts) ? (item.accounts[0] as any)?.name : (item.accounts as any)?.name,
      isRecurringReminder: true,
    })),
  ];

  return { data: items };
}
