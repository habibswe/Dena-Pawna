'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

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
    return { error: 'Person is required for lending/borrowing' };
  }
  if (!type) return { error: 'Transaction type is required' };
  if (isNaN(amount) || amount <= 0) return { error: 'Amount must be a positive number' };

  if (type === 'TRANSFER' && (!account_id || !to_account_id)) {
    return { error: 'Transfer requires both source and destination accounts' };
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
  revalidatePath('/transactions');
  revalidatePath('/accounts');
  
  return { success: true, data };
}

export async function getPaginatedTransactions(page: number, filter?: string, month?: string, search?: string) {
  const supabase = await createClient();
  const PAGE_SIZE = 20;
  const offset = (page - 1) * PAGE_SIZE;

  let query = supabase.from('transactions')
    .select('*, people(name), categories(name), accounts(name)', { count: 'exact' })
    .order('transaction_date', { ascending: false });

  if (filter && filter !== 'ALL') {
    query = query.eq('type', filter);
  }

  if (search) {
    // Since people(name) is a left join, searching inside related tables in PostgREST is tricky.
    // We can search the note and type fields easily. 
    // To search people.name, we'd ideally need a view or just search the main table for now.
    query = query.or(`note.ilike.%${search}%,type.ilike.%${search}%`);
  }

  if (month) {
    query = query.gte('transaction_date', `${month}-01`).lte('transaction_date', `${month}-31`);
  }

  query = query.range(offset, offset + PAGE_SIZE - 1);

  const { data, count, error } = await query;
  
  if (error) {
    console.error("Error fetching paginated transactions:", error);
    return { data: [], count: 0 };
  }

  return { data: data || [], count: count || 0 };
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
    return { error: 'Person is required for lending/borrowing' };
  }
  if (!type) return { error: 'Transaction type is required' };
  if (isNaN(amount) || amount <= 0) return { error: 'Amount must be a positive number' };

  if (type === 'TRANSFER' && (!account_id || !to_account_id)) {
    return { error: 'Transfer requires both source and destination accounts' };
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
  revalidatePath('/transactions');
  revalidatePath('/accounts');
  
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
  revalidatePath('/transactions');
  revalidatePath('/accounts');

  return { success: true };
}
