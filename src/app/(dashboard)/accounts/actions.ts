'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

import { calculateNextRecurringDate } from '@/lib/recurring-utils';

export async function addAccount(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'Unauthorized' };

  const name = formData.get('name') as string;
  const type = formData.get('type') as string;
  const target_amount_raw = formData.get('target_amount') as string;
  const monthly_installment_raw = formData.get('monthly_installment') as string;
  const maturity_date = (formData.get('maturity_date') as string) || null;
  const recurrence = (formData.get('recurrence') as string) || null;
  const recurring_mode = recurrence ? ((formData.get('recurring_mode') as string) || 'REMINDER_ONLY') : null;
  const source_account_id = (formData.get('source_account_id') as string) || null;

  const target_amount = target_amount_raw ? parseFloat(target_amount_raw) : null;
  const monthly_installment = monthly_installment_raw ? parseFloat(monthly_installment_raw) : null;
  const initial_balance_raw = formData.get('initial_balance') as string;
  const initial_balance = initial_balance_raw ? parseFloat(initial_balance_raw) : 0;

  if (!name || !type) return { error: 'Name and type are required' };

  const today = new Date().toISOString().split('T')[0];
  const next_recurring_date = recurrence ? calculateNextRecurringDate(today, recurrence) : null;

  const { data, error } = await supabase
    .from('accounts')
    .insert([{
      user_id: user.id,
      name,
      type,
      target_amount: isNaN(target_amount as number) ? null : target_amount,
      monthly_installment: isNaN(monthly_installment as number) ? null : monthly_installment,
      maturity_date,
      recurrence,
      recurring_mode,
      source_account_id,
      next_recurring_date
    }])
    .select()
    .single();

  if (error) return { error: error.message };

  // Create opening balance transaction if initial_balance is provided
  if (!isNaN(initial_balance) && initial_balance > 0) {
    const isGoalEligible = ['DPS', 'SAVINGS', 'FDR'].includes(type);
    await supabase.from('transactions').insert([{
      user_id: user.id,
      type: 'INCOME',
      amount: initial_balance,
      transaction_date: today,
      account_id: data.id,
      note: isGoalEligible ? 'Previous Deposits (Initial Balance)' : 'Opening Balance',
      is_recurring: false
    }]);
  }

  revalidatePath('/accounts');
  revalidatePath('/transactions');
  revalidatePath('/transactions/new');
  return { success: true, data };
}

export async function updateAccount(id: string, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'Unauthorized' };

  const name = formData.get('name') as string;
  const type = formData.get('type') as string;
  const target_amount_raw = formData.get('target_amount') as string;
  const monthly_installment_raw = formData.get('monthly_installment') as string;
  const maturity_date = (formData.get('maturity_date') as string) || null;
  const recurrence = (formData.get('recurrence') as string) || null;
  const recurring_mode = recurrence ? ((formData.get('recurring_mode') as string) || 'REMINDER_ONLY') : null;
  const source_account_id = (formData.get('source_account_id') as string) || null;

  const target_amount = target_amount_raw ? parseFloat(target_amount_raw) : null;
  const monthly_installment = monthly_installment_raw ? parseFloat(monthly_installment_raw) : null;

  if (!name || !type) return { error: 'Name and type are required' };

  const today = new Date().toISOString().split('T')[0];
  const next_recurring_date = recurrence ? calculateNextRecurringDate(today, recurrence) : null;

  const { data, error } = await supabase
    .from('accounts')
    .update({
      name,
      type,
      target_amount: isNaN(target_amount as number) ? null : target_amount,
      monthly_installment: isNaN(monthly_installment as number) ? null : monthly_installment,
      maturity_date,
      recurrence,
      recurring_mode,
      source_account_id,
      next_recurring_date: recurrence ? next_recurring_date : null
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) return { error: error.message };

  revalidatePath('/accounts');
  revalidatePath('/transactions/new');
  return { success: true, data };
}

export async function deleteAccount(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'Unauthorized' };

  const { error } = await supabase
    .from('accounts')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) return { error: error.message };

  revalidatePath('/accounts');
  revalidatePath('/transactions/new');
  return { success: true };
}
