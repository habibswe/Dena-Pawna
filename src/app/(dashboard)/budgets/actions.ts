'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function addBudget(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'Unauthorized' };

  const category_id = formData.get('category_id') as string;
  const amount = parseFloat(formData.get('amount') as string);
  const month = formData.get('month') as string;
  const is_default = formData.get('is_default') === 'true';

  if (!category_id || isNaN(amount) || amount <= 0 || !month) {
    return { error: 'Invalid input' };
  }

  // Check if budget exists for this month and category
  const { data: existing } = await supabase
    .from('budgets')
    .select('id')
    .eq('user_id', user.id)
    .eq('category_id', category_id)
    .eq('month', month)
    .single();

  let error;
  if (existing) {
    const { error: updateError } = await supabase
      .from('budgets')
      .update({ amount, is_default })
      .eq('id', existing.id);
    error = updateError;
  } else {
    const { error: insertError } = await supabase
      .from('budgets')
      .insert([{ user_id: user.id, category_id, amount, month, is_default }]);
    error = insertError;
  }

  // If user changed the recurring default status, sync it across the user's category preference
  if (!error) {
    await supabase
      .from('budgets')
      .update({ is_default })
      .eq('user_id', user.id)
      .eq('category_id', category_id);
  }

  if (error) return { error: error.message };

  revalidatePath('/budgets');
  return { success: true };
}

export async function updateBudget(id: string, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'Unauthorized' };

  const amount = parseFloat(formData.get('amount') as string);
  const is_default = formData.get('is_default') === 'true';

  if (isNaN(amount) || amount <= 0) {
    return { error: 'Invalid amount' };
  }

  const { data, error } = await supabase
    .from('budgets')
    .update({ amount, is_default })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (!error && data?.category_id) {
    // Sync default status for this category
    await supabase
      .from('budgets')
      .update({ is_default })
      .eq('user_id', user.id)
      .eq('category_id', data.category_id);
  }

  if (error) return { error: error.message };

  revalidatePath('/budgets');
  return { success: true, data };
}

export async function deleteBudget(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'Unauthorized' };

  const { error } = await supabase
    .from('budgets')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) return { error: error.message };

  revalidatePath('/budgets');
  return { success: true };
}
