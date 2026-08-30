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
 * Calculates the balance for a specific account based on transactions.
 */
export function calculateAccountBalance(accountId: string, transactions: Transaction[]): number {
  return transactions.reduce((balance, tx) => {
    const amount = Number(tx.amount);
    if (isNaN(amount)) return balance;

    // If money leaves this account
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

    // If money enters this account via transfer or saving
    if (tx.to_account_id === accountId && ['TRANSFER', 'SAVING'].includes(tx.type)) {
      balance += amount;
    }

    return balance;
  }, 0);
}

/**
 * Calculates a summary of transactions for a specific month (YYYY-MM).
 */
export function calculateMonthlySummary(transactions: Transaction[], month: string) {
  const monthlyTxs = transactions.filter(tx => tx.transaction_date.startsWith(month));
  
  let income = 0;
  let expense = 0;
  let lent = 0;
  let borrowed = 0;
  let savings = 0;
  let repaymentsReceived = 0; // RECEIVED
  let repaymentsSent = 0; // RETURNED
  
  for (const tx of monthlyTxs) {
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
  
  return {
    income,
    expense,
    lent,
    borrowed,
    savings,
    repaymentsReceived,
    repaymentsSent,
    remaining: income - expense - savings
  };
}
