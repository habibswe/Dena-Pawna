export type TransactionType = 'GIVEN' | 'RECEIVED' | 'BORROWED' | 'RETURNED' | 'INCOME' | 'EXPENSE' | 'TRANSFER' | 'SAVING';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  transaction_date: string;
  person_id?: string | null;
  category_id?: string | null;
  account_id?: string | null;
  to_account_id?: string | null;
  due_date?: string | null;
  note?: string | null;
}

/**
 * Calculates the balance for a person based on their transactions.
 * Positive = person owes user (User is net positive on this person).
 * Negative = user owes person (User is net negative on this person).
 * Zero = settled.
 * 
 * Formula: GIVEN - RECEIVED + BORROWED - RETURNED
 */
export function calculateBalance(transactions: Transaction[]): number {
  return transactions.reduce((balance, tx) => {
    const amount = Number(tx.amount);
    if (isNaN(amount)) return balance;

    switch (tx.type) {
      case 'GIVEN':
        return balance + amount;
      case 'RECEIVED':
        return balance - amount;
      case 'BORROWED':
        return balance - amount;
      case 'RETURNED':
        return balance + amount;
      default:
        return balance;
    }
  }, 0);
}

/**
 * Calculates summary for a group of people.
 */
export function calculateSummary(peopleBalances: number[]) {
  const youAreOwed = peopleBalances.filter(b => b > 0).reduce((sum, b) => sum + b, 0);
  const youOwe = peopleBalances.filter(b => b < 0).reduce((sum, b) => sum + Math.abs(b), 0);
  const netBalance = youAreOwed - youOwe;

  return {
    youAreOwed,
    youOwe,
    netBalance
  };
}

/**
 * Calculates the balance for a specific account/wallet based on transactions.
 * Double-Entry Rules:
 * - Money IN to account: INCOME, BORROWED, RECEIVED, or TRANSFER/SAVING into to_account_id
 * - Money OUT from account: EXPENSE, GIVEN, RETURNED, or TRANSFER/SAVING out of account_id
 */
export function calculateAccountBalance(accountId: string, transactions: Transaction[]): number {
  return transactions.reduce((balance, tx) => {
    const amount = Number(tx.amount);
    if (isNaN(amount)) return balance;

    // Outflow from this account
    if (tx.account_id === accountId) {
      if (['EXPENSE', 'GIVEN', 'RETURNED'].includes(tx.type)) {
        balance -= amount;
      }
      if (['INCOME', 'BORROWED', 'RECEIVED'].includes(tx.type)) {
        balance += amount;
      }
      if (['TRANSFER', 'SAVING'].includes(tx.type)) {
        balance -= amount;
      }
    }

    // Inflow to this account via Transfer or Savings
    if (tx.to_account_id === accountId && ['TRANSFER', 'SAVING'].includes(tx.type)) {
      balance += amount;
    }

    return balance;
  }, 0);
}

/**
 * Calculates total available balance across all user accounts/wallets.
 */
export function calculateTotalWalletBalance(transactions: Transaction[]): number {
  return transactions.reduce((total, tx) => {
    const amount = Number(tx.amount);
    if (isNaN(amount)) return total;

    switch (tx.type) {
      case 'INCOME':
      case 'BORROWED':
      case 'RECEIVED':
        return total + amount;
      case 'EXPENSE':
      case 'GIVEN':
      case 'RETURNED':
        return total - amount;
      // Internal transfers move between wallets; net total across all wallets remains unchanged
      case 'TRANSFER':
      case 'SAVING':
      default:
        return total;
    }
  }, 0);
}

/**
 * Calculates a summary of transactions for a specific month (YYYY-MM) or date range.
 * Includes all cash movements: Income, Expenses, Savings, Loans Given, Loans Borrowed, and Repayments.
 */
export function calculateTimeframeSummary(transactions: Transaction[], month?: string, from?: string, to?: string) {
  let filteredTxs = transactions;
  
  if (month && month !== 'all') {
    filteredTxs = transactions.filter(tx => tx.transaction_date.startsWith(month));
  } else if (from || to) {
    filteredTxs = transactions.filter(tx => {
      if (from && tx.transaction_date < from) return false;
      if (to && tx.transaction_date > to) return false;
      return true;
    });
  }
  
  let income = 0;
  let expense = 0;
  let lent = 0;
  let borrowed = 0;
  let savings = 0;
  let repaymentsReceived = 0;
  let repaymentsSent = 0;
  
  for (const tx of filteredTxs) {
    const amount = Number(tx.amount) || 0;
    switch (tx.type) {
      case 'INCOME': income += amount; break;
      case 'EXPENSE': expense += amount; break;
      case 'GIVEN': lent += amount; break;
      case 'BORROWED': borrowed += amount; break;
      case 'SAVING': savings += amount; break;
      case 'RECEIVED': repaymentsReceived += amount; break;
      case 'RETURNED': repaymentsSent += amount; break;
    }
  }

  const totalIn = income + borrowed + repaymentsReceived;
  const totalOut = expense + savings + lent + repaymentsSent;
  const netCashFlow = totalIn - totalOut;
  
  return {
    income,
    expense,
    lent,
    borrowed,
    savings,
    repaymentsReceived,
    repaymentsSent,
    totalIn,
    totalOut,
    remaining: netCashFlow
  };
}
