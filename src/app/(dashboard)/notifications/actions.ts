'use server';

import { createClient } from '@/lib/supabase/server';

export async function getPendingNotifications() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { data: [], error: 'Unauthorized' };
  }

  // Get current date string in YYYY-MM-DD
  const today = new Date().toISOString().split('T')[0];

  // We want to notify about:
  // - GIVEN: You lent money, they should RETURN it by due_date
  // - BORROWED: You borrowed money, you should RETURN it by due_date
  // We can fetch transactions where due_date <= today and type in ('GIVEN', 'BORROWED')
  
  // NOTE: A more robust system would check if it's already settled by looking at total balance for that person,
  // but for a simple reminder system, we just look at the raw transactions with a due_date.
  
  const { data, error } = await supabase
    .from('transactions')
    .select('id, type, amount, due_date, people(name)')
    .eq('user_id', user.id)
    .lte('due_date', today)
    .in('type', ['GIVEN', 'BORROWED'])
    .order('due_date', { ascending: true });

  if (error) {
    console.error("Error fetching notifications:", error);
    return { data: [], error: error.message };
  }

  return { data: data || [] };
}
