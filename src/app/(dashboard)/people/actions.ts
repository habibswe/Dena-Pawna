'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function addPerson(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Unauthorized' };
  }

  const name = formData.get('name') as string;
  const phone = formData.get('phone') as string;
  const email = formData.get('email') as string;
  const opening_balance_raw = formData.get('opening_balance') as string;
  const opening_balance_type_raw = formData.get('opening_balance_type') as string;

  if (!name || name.trim() === '') {
    return { error: 'Name is required' };
  }

  const opening_balance = opening_balance_raw ? Number(opening_balance_raw) : 0;
  const opening_balance_type = ['RECEIVABLE', 'PAYABLE', 'NONE'].includes(opening_balance_type_raw) ? opening_balance_type_raw : 'NONE';

  const payload: Record<string, any> = {
    user_id: user.id,
    name,
    phone: phone || null,
    email: email || null,
    opening_balance: (!isNaN(opening_balance) && opening_balance > 0 && opening_balance_type !== 'NONE') ? opening_balance : 0,
    opening_balance_type: (!isNaN(opening_balance) && opening_balance > 0 && opening_balance_type !== 'NONE') ? opening_balance_type : 'NONE',
  };

  let { data, error } = await supabase
    .from('people')
    .insert([payload])
    .select()
    .single();

  if (error && (error.message?.includes('opening_balance') || error.code === '42703')) {
    delete payload.opening_balance;
    delete payload.opening_balance_type;
    const retry = await supabase.from('people').insert([payload]).select().single();
    data = retry.data;
    error = retry.error;
  }

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/people');
  revalidatePath('/transactions/new');
  return { success: true, data };
}

export async function updatePerson(id: string, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Unauthorized' };
  }

  const name = formData.get('name') as string;
  const phone = formData.get('phone') as string;
  const email = formData.get('email') as string;
  const opening_balance_raw = formData.get('opening_balance') as string;
  const opening_balance_type_raw = formData.get('opening_balance_type') as string;

  if (!name || name.trim() === '') {
    return { error: 'Name is required' };
  }

  const opening_balance = opening_balance_raw ? Number(opening_balance_raw) : 0;
  const opening_balance_type = ['RECEIVABLE', 'PAYABLE', 'NONE'].includes(opening_balance_type_raw) ? opening_balance_type_raw : 'NONE';

  const updatePayload: Record<string, any> = {
    name,
    phone: phone || null,
    email: email || null,
    opening_balance: (!isNaN(opening_balance) && opening_balance > 0 && opening_balance_type !== 'NONE') ? opening_balance : 0,
    opening_balance_type: (!isNaN(opening_balance) && opening_balance > 0 && opening_balance_type !== 'NONE') ? opening_balance_type : 'NONE',
  };

  let { data, error } = await supabase
    .from('people')
    .update(updatePayload)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error && (error.message?.includes('opening_balance') || error.code === '42703')) {
    delete updatePayload.opening_balance;
    delete updatePayload.opening_balance_type;
    const retry = await supabase
      .from('people')
      .update(updatePayload)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();
    data = retry.data;
    error = retry.error;
  }

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/people');
  revalidatePath(`/people/${id}`);
  revalidatePath('/transactions/new');
  return { success: true, data };
}

export async function deletePerson(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Unauthorized' };
  }

  const { error } = await supabase
    .from('people')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/people');
  revalidatePath('/transactions/new');
  return { success: true };
}
