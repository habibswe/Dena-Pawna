import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { calculateNextRecurringDate } from '@/lib/recurring-utils';

export async function GET(request: Request) {
  try {
    const supabase = createAdminClient();
    const today = new Date().toISOString().split('T')[0];

    // Fetch all due AUTO_CREATE recurring transactions across users
    const { data: dueRecurring, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('is_recurring', true)
      .eq('recurring_mode', 'AUTO_CREATE')
      .lte('next_recurring_date', today);

    if (error) {
      console.error('Cron recurring error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!dueRecurring || dueRecurring.length === 0) {
      return NextResponse.json({ message: 'No due recurring transactions found', processedCount: 0 });
    }

    let processedCount = 0;

    for (const parentTx of dueRecurring) {
      if (parentTx.last_processed_date === today) continue;

      const executionDate = parentTx.next_recurring_date || today;

      const { error: insertErr } = await supabase
        .from('transactions')
        .insert([{
          user_id: parentTx.user_id,
          person_id: parentTx.person_id || null,
          type: parentTx.type,
          amount: parentTx.amount,
          transaction_date: executionDate,
          due_date: parentTx.due_date || null,
          note: parentTx.note ? `${parentTx.note} (Auto-recurring)` : 'Auto-recurring transaction',
          account_id: parentTx.account_id || null,
          to_account_id: parentTx.to_account_id || null,
          category_id: parentTx.category_id || null,
          parent_transaction_id: parentTx.id,
          is_recurring: false
        }]);

      if (insertErr) {
        console.error(`Cron insert error for ${parentTx.id}:`, insertErr);
        continue;
      }

      const nextDate = calculateNextRecurringDate(executionDate, parentTx.recurrence);

      await supabase
        .from('transactions')
        .update({
          next_recurring_date: nextDate,
          last_processed_date: today,
        })
        .eq('id', parentTx.id);

      processedCount++;
    }

    // Fetch all due AUTO_CREATE recurring accounts (DPS/Savings installments)
    const { data: dueAccounts } = await supabase
      .from('accounts')
      .select('*')
      .not('recurrence', 'is', null)
      .eq('recurring_mode', 'AUTO_CREATE')
      .not('source_account_id', 'is', null)
      .gt('monthly_installment', 0)
      .lte('next_recurring_date', today);

    if (dueAccounts && dueAccounts.length > 0) {
      for (const acc of dueAccounts) {
        const executionDate = acc.next_recurring_date || today;

        const { error: insertErr } = await supabase
          .from('transactions')
          .insert([{
            user_id: acc.user_id,
            type: 'SAVING',
            amount: acc.monthly_installment,
            transaction_date: executionDate,
            note: `${acc.name} (${acc.recurrence === 'WEEKLY' ? 'Weekly' : 'Monthly'} Auto-Deposit)`,
            account_id: acc.source_account_id,
            to_account_id: acc.id,
            is_recurring: false
          }]);

        if (!insertErr) {
          const nextDate = calculateNextRecurringDate(executionDate, acc.recurrence);
          await supabase
            .from('accounts')
            .update({ next_recurring_date: nextDate })
            .eq('id', acc.id);
          processedCount++;
        }
      }
    }

    return NextResponse.json({ success: true, processedCount });
  } catch (err: any) {
    console.error('Cron endpoint error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
