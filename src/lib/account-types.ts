import { createClient } from '@/lib/supabase/client';

export interface AccountTypeItem {
  id: string;
  name: string;
  code: string;
  icon?: string;
  is_active?: boolean;
}

export const DEFAULT_ACCOUNT_TYPES: AccountTypeItem[] = [
  { id: '1', name: 'Cash', code: 'CASH', icon: 'Banknote' },
  { id: '2', name: 'Bank Account', code: 'BANK', icon: 'Building2' },
  { id: '3', name: 'bKash', code: 'BKASH', icon: 'Smartphone' },
  { id: '4', name: 'Nagad', code: 'NAGAD', icon: 'Smartphone' },
  { id: '5', name: 'Rocket', code: 'ROCKET', icon: 'Smartphone' },
  { id: '6', name: 'Upay', code: 'UPAY', icon: 'Smartphone' },
  { id: '7', name: 'CellFin', code: 'CELLFIN', icon: 'Smartphone' },
  { id: '8', name: 'Tap', code: 'TAP', icon: 'Smartphone' },
  { id: '9', name: 'SureCash', code: 'SURECASH', icon: 'Smartphone' },
  { id: '10', name: 'Pocket (AB Bank)', code: 'POCKET', icon: 'Smartphone' },
  { id: '11', name: 'Credit Card', code: 'CREDIT_CARD', icon: 'CreditCard' },
  { id: '12', name: 'Debit Card', code: 'DEBIT_CARD', icon: 'CreditCard' },
  { id: '13', name: 'Savings Account', code: 'SAVINGS', icon: 'PiggyBank' },
  { id: '14', name: 'DPS (Monthly Deposit)', code: 'DPS', icon: 'Vault' },
  { id: '15', name: 'FDR (Fixed Deposit)', code: 'FDR', icon: 'Landmark' },
];

/**
 * Checks if the given account type acts as a liability / negative-balance credit account.
 */
export function isCreditAccountType(type?: string | null): boolean {
  if (!type) return false;
  const upper = type.toUpperCase();
  return upper === 'CREDIT_CARD' || upper === 'CARD';
}

export async function fetchActiveAccountTypes(): Promise<AccountTypeItem[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('account_types')
      .select('id, name, code, icon, is_active')
      .eq('is_active', true)
      .order('created_at', { ascending: true });

    if (error || !data || data.length === 0) {
      return DEFAULT_ACCOUNT_TYPES;
    }

    const hasDebitCard = data.some(d => d.code === 'DEBIT_CARD');

    // Map legacy 'CARD' / 'Credit/Debit Card' to explicit 'Credit Card'
    const mappedData = data.map(item => {
      if (item.code === 'CARD' || item.name === 'Credit/Debit Card') {
        return { ...item, name: 'Credit Card', code: 'CREDIT_CARD' };
      }
      return item;
    });

    if (!hasDebitCard) {
      const ccIndex = mappedData.findIndex(d => d.code === 'CREDIT_CARD' || d.code === 'CARD');
      if (ccIndex !== -1) {
        mappedData.splice(ccIndex + 1, 0, {
          id: 'debit_card_virtual',
          name: 'Debit Card',
          code: 'DEBIT_CARD',
          icon: 'CreditCard',
          is_active: true
        });
      }
    }

    return mappedData;
  } catch (err) {
    return DEFAULT_ACCOUNT_TYPES;
  }
}
