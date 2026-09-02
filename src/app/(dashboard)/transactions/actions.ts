'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { calculateAccountBalance } from '@/lib/calculations';

export async function addTransaction(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Unauthorized' };
  }

  const person_id = formData.get('person_id') as string;
  const type = formData.get('type') as string;
  const amount = parseFloat(formData.get('amount') as string);
  const transaction_date = formData.get('transaction_date') as string || new Date().toISOString().split('T')[0];
  const due_date = formData.get('due_date') as string;
  const note = formData.get('note') as string;
  const account_id = formData.get('account_id') as string;
  const to_account_id = formData.get('to_account_id') as string;
  const category_id = formData.get('category_id') as string;
  const recurrence = formData.get('recurrence') as string;

  if (['GIVEN', 'RECEIVED', 'BORROWED', 'RETURNED'].includes(type) && !person_id) {
    return { error: 'Person is required for credit/debt transactions' };
  }
  if (!type) return { error: 'Transaction type is required' };
  if (isNaN(amount) || amount <= 0) return { error: 'Amount must be a positive number' };

  if (['TRANSFER', 'SAVING'].includes(type)) {
    if (!account_id || !to_account_id) {
      return { error: type === 'SAVING' ? 'Saving requires both source and savings destination accounts' : 'Transfer requires both source and destination accounts' };
    }
    if (account_id === to_account_id) {
      return { error: 'Source and destination accounts must be different' };
    }
  } else if (['GIVEN', 'RECEIVED', 'BORROWED', 'RETURNED', 'EXPENSE', 'INCOME'].includes(type) && !account_id) {
    return { error: 'Please select an account/wallet for this transaction' };
  }

  // Insufficient Balance Check on source account
  if (['EXPENSE', 'GIVEN', 'RETURNED', 'SAVING', 'TRANSFER'].includes(type) && account_id) {
    const { data: userTxs } = await supabase
      .from('transactions')
      .select('id, account_id, to_account_id, type, amount')
      .eq('user_id', user.id);
    
    const availableBalance = calculateAccountBalance(account_id, (userTxs || []) as any);
    if (availableBalance < amount) {
      return { 
        error: `Insufficient balance in selected account. Available balance is ৳${availableBalance.toLocaleString()}` 
      };
    }
  }

  const { data, error } = await supabase
    .from('transactions')
    .insert([{
      user_id: user.id,
      person_id: person_id || null,
      type,
      amount,
      transaction_date,
      due_date: due_date || null,
      note: note || null,
      account_id: account_id || null,
      to_account_id: to_account_id || null,
      category_id: category_id || null,
      is_recurring: !!recurrence,
      recurrence: recurrence || null,
    }])
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/');
  revalidatePath('/people');
  if (person_id) revalidatePath(`/people/${person_id}`);
  revalidatePath('/transactions', 'page');
  revalidatePath('/accounts');
  revalidatePath('/dashboard');
  
  return { success: true, data };
}

export async function getPaginatedTransactions(page: number, filter?: string, month?: string, search?: string) {
  const supabase = await createClient();
  const PAGE_SIZE = 20;
  const offset = (page - 1) * PAGE_SIZE;

  let query = supabase.from('transactions')
    .select('*, people(id, name), categories(id, name), accounts!transactions_account_id_fkey(id, name)', { count: 'exact' })
    .order('transaction_date', { ascending: false })
    .order('created_at', { ascending: false });

  if (filter && filter !== 'ALL') {
    query = query.eq('type', filter);
  }

  if (search) {
    query = query.or(`note.ilike.%${search}%,type.ilike.%${search}%`);
  }

  if (month && month !== 'all') {
    const [yearStr, monthStr] = month.split('-');
    const monthDate = new Date(parseInt(yearStr, 10), parseInt(monthStr, 10) - 1, 1);
    const startDate = format(startOfMonth(monthDate), 'yyyy-MM-dd');
    const endDate = format(endOfMonth(monthDate), 'yyyy-MM-dd') + 'T23:59:59.999Z';
    query = query.gte('transaction_date', startDate).lte('transaction_date', endDate);
  }

  query = query.range(offset, offset + PAGE_SIZE - 1);

  const { data: transactionsData, count, error: txError } = await query;

  if (txError) {
    console.error("Error fetching paginated transactions:", txError);
    return { data: [], count: 0 };
  }

  return { data: transactionsData || [], count: count || 0 };
}

export async function updateTransaction(id: string, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Unauthorized' };
  }

  const person_id = formData.get('person_id') as string;
  const type = formData.get('type') as string;
  const amount = parseFloat(formData.get('amount') as string);
  const transaction_date = formData.get('transaction_date') as string || new Date().toISOString().split('T')[0];
  const due_date = formData.get('due_date') as string;
  const note = formData.get('note') as string;
  const account_id = formData.get('account_id') as string;
  const to_account_id = formData.get('to_account_id') as string;
  const category_id = formData.get('category_id') as string;
  const recurrence = formData.get('recurrence') as string;

  if (['GIVEN', 'RECEIVED', 'BORROWED', 'RETURNED'].includes(type) && !person_id) {
    return { error: 'Person is required for credit/debt transactions' };
  }
  if (!type) return { error: 'Transaction type is required' };
  if (isNaN(amount) || amount <= 0) return { error: 'Amount must be a positive number' };

  if (['TRANSFER', 'SAVING'].includes(type)) {
    if (!account_id || !to_account_id) {
      return { error: type === 'SAVING' ? 'Saving requires both source and savings destination accounts' : 'Transfer requires both source and destination accounts' };
    }
    if (account_id === to_account_id) {
      return { error: 'Source and destination accounts must be different' };
    }
  } else if (['GIVEN', 'RECEIVED', 'BORROWED', 'RETURNED', 'EXPENSE', 'INCOME'].includes(type) && !account_id) {
    return { error: 'Please select an account/wallet for this transaction' };
  }

  // Insufficient Balance Check on source account (excluding current tx when editing)
  if (['EXPENSE', 'GIVEN', 'RETURNED', 'SAVING', 'TRANSFER'].includes(type) && account_id) {
    const { data: userTxs } = await supabase
      .from('transactions')
      .select('id, account_id, to_account_id, type, amount')
      .eq('user_id', user.id);
    
    const otherTxs = (userTxs || []).filter(tx => tx.id !== id);
    const availableBalance = calculateAccountBalance(account_id, otherTxs as any);
    if (availableBalance < amount) {
      return { 
        error: `Insufficient balance in selected account. Available balance is ৳${availableBalance.toLocaleString()}` 
      };
    }
  }

  const { data, error } = await supabase
    .from('transactions')
    .update({
      person_id: person_id || null,
      type,
      amount,
      transaction_date,
      due_date: due_date || null,
      note: note || null,
      account_id: account_id || null,
      to_account_id: to_account_id || null,
      category_id: category_id || null,
      is_recurring: !!recurrence,
      recurrence: recurrence || null,
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/');
  revalidatePath('/people');
  if (person_id) revalidatePath(`/people/${person_id}`);
  revalidatePath('/transactions', 'page');
  revalidatePath('/accounts');
  revalidatePath('/dashboard');
  
  return { success: true, data };
}

export async function deleteTransaction(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Unauthorized' };
  }

  // Fetch the transaction first to know which person_id to revalidate
  const { data: existingTx } = await supabase
    .from('transactions')
    .select('person_id')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  const { error } = await supabase
    .from('transactions')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/');
  revalidatePath('/people');
  if (existingTx?.person_id) revalidatePath(`/people/${existingTx.person_id}`);
  revalidatePath('/transactions', 'page');
  revalidatePath('/accounts');

  return { success: true };
}
