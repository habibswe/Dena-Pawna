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

export async function exportSystemBackup(): Promise<{ success?: boolean; backup?: any; error?: string }> {
  try {
    await verifyAdmin();
    const supabase = createAdminClient();

    const [
      { data: profiles },
      { data: people },
      { data: categories },
      { data: accounts },
      { data: budgets },
      { data: transactions },
    ] = await Promise.all([
      supabase.from('profiles').select('*'),
      supabase.from('people').select('*'),
      supabase.from('categories').select('*'),
      supabase.from('accounts').select('*'),
      supabase.from('budgets').select('*'),
      supabase.from('transactions').select('*'),
    ]);

    const recordCounts = {
      profiles: profiles?.length || 0,
      people: people?.length || 0,
      categories: categories?.length || 0,
      accounts: accounts?.length || 0,
      budgets: budgets?.length || 0,
      transactions: transactions?.length || 0,
    };

    // Record audit log
    try {
      await supabase.from('system_logs').insert([{
        action: 'BACKUP_EXPORT',
        details: {
          summary: recordCounts,
          exported_at: new Date().toISOString(),
        }
      }]);
    } catch (err) {
      console.error('Failed to record system_log for export:', err);
    }

    return {
      success: true,
      backup: {
        version: '1.0',
        exported_at: new Date().toISOString(),
        counts: recordCounts,
        data: {
          profiles: profiles || [],
          people: people || [],
          categories: categories || [],
          accounts: accounts || [],
          budgets: budgets || [],
          transactions: transactions || [],
        }
      }
    };
  } catch (err: any) {
    return { error: err.message || 'Failed to export system backup' };
  }
}

export async function restoreSystemBackup(backup: any) {
  await verifyAdmin();
  const supabase = createAdminClient();

  if (!backup) {
    return { error: 'Invalid backup file' };
  }

  const data = backup.data || backup.backup?.data || backup.backup || (backup.profiles || backup.transactions || backup.accounts || backup.people || backup.categories || backup.budgets ? backup : null) || (Array.isArray(backup) ? { transactions: backup } : null);

  if (!data) {
    return { error: 'Invalid backup file format: missing data payload' };
  }

  const counts = {
    profiles: 0,
    people: 0,
    categories: 0,
    accounts: 0,
    budgets: 0,
    transactions: 0,
  };

  try {
    // 1. Profiles
    if (Array.isArray(data.profiles) && data.profiles.length > 0) {
      const { data: res, error: err } = await supabase.from('profiles').upsert(data.profiles, { onConflict: 'id' }).select('id');
      if (err) throw new Error(`Profiles restore error: ${err.message}`);
      counts.profiles = res?.length || data.profiles.length;
    }

    // 2. Categories
    if (Array.isArray(data.categories) && data.categories.length > 0) {
      const { data: res, error: err } = await supabase.from('categories').upsert(data.categories, { onConflict: 'id' }).select('id');
      if (err) throw new Error(`Categories restore error: ${err.message}`);
      counts.categories = res?.length || data.categories.length;
    }

    // 3. Accounts
    if (Array.isArray(data.accounts) && data.accounts.length > 0) {
      const { data: res, error: err } = await supabase.from('accounts').upsert(data.accounts, { onConflict: 'id' }).select('id');
      if (err) throw new Error(`Accounts restore error: ${err.message}`);
      counts.accounts = res?.length || data.accounts.length;
    }

    // 4. People
    if (Array.isArray(data.people) && data.people.length > 0) {
      const { data: res, error: err } = await supabase.from('people').upsert(data.people, { onConflict: 'id' }).select('id');
      if (err) throw new Error(`People restore error: ${err.message}`);
      counts.people = res?.length || data.people.length;
    }

    // 5. Budgets
    if (Array.isArray(data.budgets) && data.budgets.length > 0) {
      const { data: res, error: err } = await supabase.from('budgets').upsert(data.budgets, { onConflict: 'id' }).select('id');
      if (err) throw new Error(`Budgets restore error: ${err.message}`);
      counts.budgets = res?.length || data.budgets.length;
    }

    // 6. Transactions
    if (Array.isArray(data.transactions) && data.transactions.length > 0) {
      const { data: res, error: err } = await supabase.from('transactions').upsert(data.transactions, { onConflict: 'id' }).select('id');
      if (err) throw new Error(`Transactions restore error: ${err.message}`);
      counts.transactions = res?.length || data.transactions.length;
    }

    // Record audit log
    try {
      await supabase.from('system_logs').insert([{
        action: 'BACKUP_RESTORE',
        details: {
          summary: counts,
          restored_at: new Date().toISOString(),
        }
      }]);
    } catch (err) {
      console.error('Failed to record system_log for restore:', err);
    }

    revalidatePath('/', 'layout');
    revalidatePath('/super-admin', 'layout');

    return { success: true, counts };
  } catch (err: any) {
    console.error('Error during system restore:', err);
    return { error: err.message || 'Failed to restore system backup' };
  }
}

export async function getBackupLogs() {
  try {
    await verifyAdmin();
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from('system_logs')
      .select('*')
      .in('action', ['BACKUP_EXPORT', 'BACKUP_RESTORE'])
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      return [];
    }
    return data || [];
  } catch {
    return [];
  }
}

export async function deleteBackupLog(id: string) {
  try {
    await verifyAdmin();
    const supabase = createAdminClient();

    const { error } = await supabase
      .from('system_logs')
      .delete()
      .eq('id', id);

    if (error) return { error: error.message };

    revalidatePath('/super-admin/backups');
    return { success: true };
  } catch (err: any) {
    return { error: err.message || 'Failed to delete log' };
  }
}

export async function clearAllBackupLogs() {
  try {
    await verifyAdmin();
    const supabase = createAdminClient();

    const { error } = await supabase
      .from('system_logs')
      .delete()
      .in('action', ['BACKUP_EXPORT', 'BACKUP_RESTORE']);

    if (error) return { error: error.message };

    revalidatePath('/super-admin/backups');
    return { success: true };
  } catch (err: any) {
    return { error: err.message || 'Failed to clear logs' };
  }
}
