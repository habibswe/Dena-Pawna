'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';

async function verifyAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token')?.value;
  if (token !== 'true') {
    throw new Error('Unauthorized: Admin access required');
  }
}

export async function createAccountType(formData: FormData) {
  try {
    await verifyAdmin();
    const supabase = createAdminClient();
    const name = formData.get('name') as string;
    const codeRaw = formData.get('code') as string;
    const icon = (formData.get('icon') as string) || 'CreditCard';
    const is_active = formData.get('is_active') === 'true';

    if (!name || name.trim() === '') {
      return { error: 'Account type name is required' };
    }

    const code = (codeRaw || name).toUpperCase().replace(/\s+/g, '_');

    const { error } = await supabase.from('account_types').insert({
      name: name.trim(),
      code: code,
      icon: icon,
      is_active: is_active,
    });

    if (error) {
      return { error: error.message };
    }

    revalidatePath('/super-admin/account-types');
    revalidatePath('/accounts');
    return { success: true };
  } catch (err: any) {
    return { error: err.message || 'Failed to create account type' };
  }
}

export async function updateAccountType(id: string, formData: FormData) {
  try {
    await verifyAdmin();
    const supabase = createAdminClient();
    const name = formData.get('name') as string;
    const codeRaw = formData.get('code') as string;
    const icon = (formData.get('icon') as string) || 'CreditCard';
    const is_active = formData.get('is_active') === 'true';

    if (!name || name.trim() === '') {
      return { error: 'Account type name is required' };
    }

    const code = (codeRaw || name).toUpperCase().replace(/\s+/g, '_');

    const { error } = await supabase
      .from('account_types')
      .update({
        name: name.trim(),
        code: code,
        icon: icon,
        is_active: is_active,
      })
      .eq('id', id);

    if (error) {
      return { error: error.message };
    }

    revalidatePath('/super-admin/account-types');
    revalidatePath('/accounts');
    return { success: true };
  } catch (err: any) {
    return { error: err.message || 'Failed to update account type' };
  }
}

export async function deleteAccountType(id: string) {
  try {
    await verifyAdmin();
    const supabase = createAdminClient();
    const { error } = await supabase.from('account_types').delete().eq('id', id);

    if (error) {
      return { error: error.message };
    }

    revalidatePath('/super-admin/account-types');
    revalidatePath('/accounts');
    return { success: true };
  } catch (err: any) {
    return { error: err.message || 'Failed to delete account type' };
  }
}
