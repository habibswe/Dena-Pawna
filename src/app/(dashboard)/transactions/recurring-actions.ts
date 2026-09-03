'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { calculateNextRecurringDate } from '@/lib/recurring-utils';

/**
 * Automatically processes all AUTO_CREATE recurring transactions whose next_recurring_date <= today
 */
export async function processDueRecurringTransactions() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false, error: 'Unauthorized' };

  const today = new Date().toISOString().split('T')[0];

  // Fetch due AUTO_CREATE recurring transactions
  const { data: dueRecurring, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_recurring', true)
    .eq('recurring_mode', 'AUTO_CREATE')
    .lte('next_recurring_date', today);

  if (error) {
    console.error('Error fetching due recurring transactions:', error);
    return { success: false, error: error.message };
  }

  if (!dueRecurring || dueRecurring.length === 0) {
    return { success: true, processedCount: 0 };
  }

  let processedCount = 0;

  for (const parentTx of dueRecurring) {
    // Avoid double processing on the same day if last_processed_date is today
    if (parentTx.last_processed_date === today) continue;

    const executionDate = parentTx.next_recurring_date || today;

    // Create the auto transaction
    const { error: insertErr } = await supabase
      .from('transactions')
      .insert([{
        user_id: user.id,
        person_id: parentTx.person_id || null,
        type: parentTx.type,
        amount: parentTx.amount,
        transaction_date: executionDate,
        due_date: parentTx.due_date || null,
        note: parentTx.note ? `${parentTx.note} (Auto-recurring)` : 'Auto-recurring transaction',
        account_id: parentTx.account_id || null,
        to_account_id: parentTx.to_account_id || null,
        category_id: parentTx.category_id || null,
        parent_transaction_id: parentTx.id,
        is_recurring: false
      }]);

    if (insertErr) {
      console.error(`Failed to auto-create transaction for ${parentTx.id}:`, insertErr);
      continue;
    }

    // Calculate next recurrence date
    const nextDate = calculateNextRecurringDate(executionDate, parentTx.recurrence);

    // Update parent recurring transaction
    await supabase
      .from('transactions')
      .update({
        next_recurring_date: nextDate,
        last_processed_date: today,
      })
      .eq('id', parentTx.id)
      .eq('user_id', user.id);

    processedCount++;
  }

  if (processedCount > 0) {
    revalidatePath('/');
    revalidatePath('/transactions');
    revalidatePath('/accounts');
    revalidatePath('/dashboard');
  }

  return { success: true, processedCount };
}

/**
 * Confirms a REMINDER_ONLY recurring transaction by creating the actual transaction instance
 */
export async function confirmRecurringReminder(parentId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'Unauthorized' };

  const today = new Date().toISOString().split('T')[0];

  // Fetch the parent transaction
  const { data: parentTx, error: fetchErr } = await supabase
    .from('transactions')
    .select('*')
    .eq('id', parentId)
    .eq('user_id', user.id)
    .single();

  if (fetchErr || !parentTx) {
    return { error: fetchErr?.message || 'Recurring item not found' };
  }

  const executionDate = parentTx.next_recurring_date || today;

  // Insert the new transaction instance
  const { error: insertErr } = await supabase
    .from('transactions')
    .insert([{
      user_id: user.id,
      person_id: parentTx.person_id || null,
      type: parentTx.type,
      amount: parentTx.amount,
      transaction_date: executionDate,
      due_date: parentTx.due_date || null,
      note: parentTx.note ? `${parentTx.note} (Confirmed Recurring)` : 'Confirmed Recurring transaction',
      account_id: parentTx.account_id || null,
      to_account_id: parentTx.to_account_id || null,
      category_id: parentTx.category_id || null,
      parent_transaction_id: parentTx.id,
      is_recurring: false
    }]);

  if (insertErr) {
    return { error: insertErr.message };
  }

  // Calculate next recurrence date and update parent
  const nextDate = calculateNextRecurringDate(executionDate, parentTx.recurrence);
  await supabase
    .from('transactions')
    .update({
      next_recurring_date: nextDate,
      last_processed_date: today,
    })
    .eq('id', parentTx.id)
    .eq('user_id', user.id);

  revalidatePath('/');
  revalidatePath('/transactions');
  revalidatePath('/accounts');
  revalidatePath('/dashboard');

  return { success: true };
}

/**
 * Dismisses/skips the current cycle of a REMINDER_ONLY recurring transaction
 */
export async function dismissRecurringReminder(parentId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'Unauthorized' };

  const today = new Date().toISOString().split('T')[0];

  const { data: parentTx, error: fetchErr } = await supabase
    .from('transactions')
    .select('next_recurring_date, recurrence')
    .eq('id', parentId)
    .eq('user_id', user.id)
    .single();

  if (fetchErr || !parentTx) {
    return { error: fetchErr?.message || 'Recurring item not found' };
  }

  const baseDate = parentTx.next_recurring_date || today;
  const nextDate = calculateNextRecurringDate(baseDate, parentTx.recurrence);

  await supabase
    .from('transactions')
    .update({
      next_recurring_date: nextDate,
      last_processed_date: today,
    })
    .eq('id', parentId)
    .eq('user_id', user.id);

  revalidatePath('/');
  revalidatePath('/transactions');
  return { success: true };
}
