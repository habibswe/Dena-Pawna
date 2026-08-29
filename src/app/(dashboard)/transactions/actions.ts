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
  const note = formData.get('note') as string;

  if (!person_id) return { error: 'Person is required' };
  if (!type) return { error: 'Transaction type is required' };
  if (isNaN(amount) || amount <= 0) return { error: 'Amount must be a positive number' };

  const { data, error } = await supabase
    .from('transactions')
    .insert([{
      user_id: user.id,
      person_id,
      type,
      amount,
      transaction_date,
      note: note || null,
    }])
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/');
  revalidatePath('/people');
  revalidatePath(`/people/${person_id}`);
  revalidatePath('/transactions');
  
  return { success: true, data };
}

export async function getPaginatedTransactions(page: number, filter?: string, from?: string, to?: string, search?: string) {
  const supabase = await createClient();
  const PAGE_SIZE = 20;
  const offset = (page - 1) * PAGE_SIZE;

  let query = supabase.from('transactions')
    .select('*, people!inner(name)', { count: 'exact' })
    .order('transaction_date', { ascending: false });

  if (filter && filter !== 'ALL') {
    query = query.eq('type', filter);
  }

  if (search) {
    query = query.or(`people.name.ilike.%${search}%,note.ilike.%${search}%,type.ilike.%${search}%`);
  }

  if (from && to) {
    query = query.gte('transaction_date', new Date(from).toISOString()).lte('transaction_date', new Date(`${to}T23:59:59.999Z`).toISOString());
  } else if (from) {
    query = query.gte('transaction_date', new Date(from).toISOString());
  } else if (to) {
    query = query.lte('transaction_date', new Date(`${to}T23:59:59.999Z`).toISOString());
  }

  query = query.range(offset, offset + PAGE_SIZE - 1);

  const { data, count, error } = await query;
  
  if (error) {
    console.error("Error fetching paginated transactions:", error);
    return { data: [], count: 0 };
  }

  return { data: data || [], count: count || 0 };
}
