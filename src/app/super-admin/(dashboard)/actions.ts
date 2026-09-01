'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';

export async function deletePerson(personId: string) {
  const supabase = createAdminClient();
  const { error } = await supabase.from('people').delete().eq('id', personId);
  if (error) {
    return { error: error.message };
  }
  revalidatePath('/super-admin/people');
  revalidatePath('/', 'layout');
  return { success: true };
}

export async function deleteTransaction(transactionId: string) {
  const supabase = createAdminClient();
  const { error } = await supabase.from('transactions').delete().eq('id', transactionId);
  if (error) {
    return { error: error.message };
  }
  revalidatePath('/super-admin/transactions');
  revalidatePath('/', 'layout');
  return { success: true };
}

export async function updatePerson(personId: string, formData: FormData) {
  const supabase = createAdminClient();
  const name = formData.get('name') as string;
  const phone = formData.get('phone') as string;

  if (!name) throw new Error('Name is required');

  const { error } = await supabase
    .from('people')
    .update({ name, phone: phone || null })
    .eq('id', personId);

  if (error) {
    console.error('Failed to update person:', error);
    throw new Error(error.message);
  }
  revalidatePath('/super-admin/people');
  revalidatePath('/', 'layout');
}

export async function updateTransaction(transactionId: string, formData: FormData) {
  const supabase = createAdminClient();
  const type = formData.get('type') as string;
  const amount = parseFloat(formData.get('amount') as string);
  const transaction_date = formData.get('transaction_date') as string;
  const note = formData.get('note') as string;

  if (!type) throw new Error('Type is required');
  if (isNaN(amount) || amount <= 0) throw new Error('Valid amount is required');

  const updateData: any = { type, amount, note: note || null };
  if (transaction_date) updateData.transaction_date = transaction_date;

  const { error } = await supabase
    .from('transactions')
    .update(updateData)
    .eq('id', transactionId);

  if (error) {
    console.error('Failed to update transaction:', error);
    throw new Error(error.message);
  }
  revalidatePath('/super-admin/transactions');
  revalidatePath('/', 'layout');
}

export async function createSystemUser(formData: FormData) {
  const supabase = createAdminClient();
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const fullName = formData.get('fullName') as string;

  if (!email || !password || !fullName) throw new Error('Email, Password, and Full Name are required');
  if (password.length < 6) throw new Error('Password must be at least 6 characters');

  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (authError) {
    console.error('Failed to create auth user:', authError);
    throw new Error(authError.message);
  }

  if (authData.user) {
    const { error: profileError } = await supabase.from('profiles')
      .update({ full_name: fullName })
      .eq('id', authData.user.id);
    
    if (profileError) {
      await supabase.auth.admin.deleteUser(authData.user.id);
      console.error('Failed to create profile:', profileError);
      throw new Error(profileError.message);
    }
  }

  revalidatePath('/super-admin/users');
}

export async function updateSystemUser(userId: string, formData: FormData) {
  const supabase = createAdminClient();
  const fullName = formData.get('fullName') as string;
  const password = formData.get('password') as string;

  if (!fullName) throw new Error('Full Name is required');

  const { error: profileError } = await supabase.from('profiles').update({ full_name: fullName }).eq('id', userId);
  if (profileError) {
    console.error('Failed to update profile:', profileError);
    throw new Error(profileError.message);
  }

  if (password) {
    if (password.length < 6) throw new Error('Password must be at least 6 characters');
    const { error: authError } = await supabase.auth.admin.updateUserById(userId, { password });
    if (authError) {
      console.error('Failed to update password:', authError);
      throw new Error(authError.message);
    }
  }

  revalidatePath('/super-admin/users');
}

export async function deleteSystemUser(userId: string) {
  const supabase = createAdminClient();
  
  await supabase.from('profiles').delete().eq('id', userId);
  
  const { error } = await supabase.auth.admin.deleteUser(userId);
  if (error) {
    return { error: error.message };
  }

  revalidatePath('/super-admin/users');
  return { success: true };
}

export async function deleteAccount(accountId: string) {
  const supabase = createAdminClient();
  const { error } = await supabase.from('accounts').delete().eq('id', accountId);
  if (error) return { error: error.message };
  revalidatePath('/super-admin/accounts');
  revalidatePath('/', 'layout');
  return { success: true };
}

export async function updateAccount(accountId: string, formData: FormData) {
  const supabase = createAdminClient();
  const name = formData.get('name') as string;
  const type = formData.get('type') as string;

  if (!name || !type) throw new Error('Name and type are required');

  const { error } = await supabase.from('accounts').update({ name, type }).eq('id', accountId);
  if (error) throw new Error(error.message);
  revalidatePath('/super-admin/accounts');
  revalidatePath('/', 'layout');
}

export async function deleteCategory(categoryId: string) {
  const supabase = createAdminClient();
  const { error } = await supabase.from('categories').delete().eq('id', categoryId);
  if (error) return { error: error.message };
  revalidatePath('/super-admin/categories');
  revalidatePath('/', 'layout');
  return { success: true };
}

export async function updateCategory(categoryId: string, formData: FormData) {
  const supabase = createAdminClient();
  const name = formData.get('name') as string;
  const type = formData.get('type') as string;
  const icon = formData.get('icon') as string;
  const budget_limit = formData.get('budget_limit');

  if (!name || !type || !icon) throw new Error('Name, type, and icon are required');

  const { error } = await supabase.from('categories').update({
    name, type, icon, budget_limit: budget_limit ? parseFloat(budget_limit as string) : null
  }).eq('id', categoryId);

  if (error) throw new Error(error.message);
  revalidatePath('/super-admin/categories');
  revalidatePath('/', 'layout');
}

export async function deleteBudget(budgetId: string) {
  const supabase = createAdminClient();
  const { error } = await supabase.from('budgets').delete().eq('id', budgetId);
  if (error) return { error: error.message };
  revalidatePath('/super-admin/budgets');
  revalidatePath('/', 'layout');
  return { success: true };
}

export async function updateBudget(budgetId: string, formData: FormData) {
  const supabase = createAdminClient();
  const amount = parseFloat(formData.get('amount') as string);
  const month = formData.get('month') as string;

  if (isNaN(amount) || amount <= 0) throw new Error('Valid amount is required');

  const { error } = await supabase.from('budgets').update({ amount, month }).eq('id', budgetId);
  if (error) throw new Error(error.message);
  revalidatePath('/super-admin/budgets');
  revalidatePath('/', 'layout');
}
