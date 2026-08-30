'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function addCategory(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'Unauthorized' };

  const name = formData.get('name') as string;
  const type = formData.get('type') as string;
  const icon = formData.get('icon') as string;

  if (!name || !type) return { error: 'Name and type are required' };

  const { data, error } = await supabase
    .from('categories')
    .insert([{ user_id: user.id, name, type, icon: icon || 'Tag' }])
    .select()
    .single();

  if (error) return { error: error.message };

  revalidatePath('/categories');
  revalidatePath('/transactions/new');
  return { success: true, data };
}

export async function updateCategory(id: string, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'Unauthorized' };

  const name = formData.get('name') as string;
  const type = formData.get('type') as string;
  const icon = formData.get('icon') as string;

  if (!name || !type) return { error: 'Name and type are required' };

  const { data, error } = await supabase
    .from('categories')
    .update({ name, type, icon: icon || 'Tag' })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) return { error: error.message };

  revalidatePath('/categories');
  revalidatePath('/transactions/new');
  return { success: true, data };
}

export async function deleteCategory(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'Unauthorized' };

  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) return { error: error.message };

  revalidatePath('/categories');
  revalidatePath('/transactions/new');
  return { success: true };
}
