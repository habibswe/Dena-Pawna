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

  if (!name || name.trim() === '') {
    return { error: 'Name is required' };
  }

  const { data, error } = await supabase
    .from('people')
    .insert([{
      user_id: user.id,
      name,
      phone: phone || null,
      email: email || null,
    }])
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/people');
  revalidatePath('/transactions/new');
  return { success: true, data };
}
