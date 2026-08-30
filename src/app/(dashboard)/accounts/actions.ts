'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function addAccount(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'Unauthorized' };

  const name = formData.get('name') as string;
  const type = formData.get('type') as string;

  if (!name || !type) return { error: 'Name and type are required' };

  const { data, error } = await supabase
    .from('accounts')
    .insert([{ user_id: user.id, name, type }])
    .select()
    .single();

  if (error) return { error: error.message };

  revalidatePath('/accounts');
  revalidatePath('/transactions/new');
  return { success: true, data };
}

export async function updateAccount(id: string, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'Unauthorized' };

  const name = formData.get('name') as string;
  const type = formData.get('type') as string;

  if (!name || !type) return { error: 'Name and type are required' };

  const { data, error } = await supabase
    .from('accounts')
    .update({ name, type })
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
