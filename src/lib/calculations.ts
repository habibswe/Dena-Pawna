export type TransactionType = 'GIVEN' | 'RECEIVED' | 'BORROWED' | 'RETURNED';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  transaction_date: string;
  person_id?: string;
  note?: string;
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
        return balance - amount; // Wait, if I borrow money from Rahim, I owe Rahim. Thus balance should be negative. Let's see: GIVEN (+), RECEIVED (-). BORROWED means they gave me money, so I owe them (-).
      case 'RETURNED':
        return balance + amount; // If I return money to Rahim, my debt goes down, so balance goes up (+).
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
