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

export interface PersonMetadata {
  id?: string;
  name?: string;
  opening_balance?: number | null;
  opening_balance_type?: string | null; // 'RECEIVABLE' | 'PAYABLE' | 'NONE'
}

/**
 * Calculates the balance for a person based on their transactions and optional opening balance.
 * 
 * Positive (> 0) = Person owes user (Receivable / আপনি পাবেন).
 * Negative (< 0) = User owes person (Payable / আপনি দেবেন).
 * Zero (= 0) = Settled (সব পরিশোধিত).
 * 
 * Smart Edge Case Guard:
 * - A 'RETURNED' (repayment paid by user) reduces active borrowing liability.
 *   If user had no prior borrowing liability (borrowedPool is 0) or pays off the entire debt,
 *   net payable liability becomes 0. It NEVER creates an artificial receivable asset.
 * - Similarly, a 'RECEIVED' (repayment received by user) reduces active lending asset.
 *   If user had no active lentPool, net receivable becomes 0 and never creates an artificial payable liability.
 */
export function calculateBalance(
  transactions: Transaction[], 
  person?: PersonMetadata
): number {
  const openingAmount = Number(person?.opening_balance || 0);
  const openingType = person?.opening_balance_type || 'NONE';

  let initialReceivable = 0;
  let initialPayable = 0;

  if (openingType === 'RECEIVABLE' && !isNaN(openingAmount) && openingAmount > 0) {
    initialReceivable = openingAmount;
  } else if (openingType === 'PAYABLE' && !isNaN(openingAmount) && openingAmount > 0) {
    initialPayable = openingAmount;
  }

  let totalGiven = 0;
  let totalReceived = 0;
  let totalBorrowed = 0;
  let totalReturned = 0;

  for (const tx of transactions) {
    const amount = Number(tx.amount);
    if (isNaN(amount) || amount <= 0) continue;

    switch (tx.type) {
      case 'GIVEN':
        totalGiven += amount;
        break;
      case 'RECEIVED':
        totalReceived += amount;
        break;
      case 'BORROWED':
        totalBorrowed += amount;
        break;
      case 'RETURNED':
        totalReturned += amount;
        break;
      default:
        break;
    }
  }

  // 1. Lending pool (Money user lent to contact)
  const lentPool = initialReceivable + totalGiven;
  const netReceivable = Math.max(0, lentPool - totalReceived);

  // 2. Borrowing pool (Money user borrowed from contact)
  const borrowedPool = initialPayable + totalBorrowed;
  const netPayable = Math.max(0, borrowedPool - totalReturned);

  // Net outstanding balance between user and contact
  return netReceivable - netPayable;
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
