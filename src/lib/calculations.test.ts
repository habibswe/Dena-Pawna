import { calculateBalance, calculateAccountBalance, calculateMonthlySummary, Transaction } from './calculations';
import { describe, it, expect } from 'vitest';

describe('calculateBalance', () => {
  it('should calculate correct balance for given and received', () => {
    const transactions: Transaction[] = [
      { id: '1', type: 'GIVEN', amount: 1000, transaction_date: '2026-08-29' },
      { id: '2', type: 'RECEIVED', amount: 500, transaction_date: '2026-08-29' }
    ];
    expect(calculateBalance(transactions)).toBe(500);
  });

  it('should calculate correct balance for given and borrowed', () => {
    const transactions: Transaction[] = [
      { id: '1', type: 'GIVEN', amount: 1000, transaction_date: '2026-08-29' },
      { id: '2', type: 'BORROWED', amount: 2000, transaction_date: '2026-08-29' }
    ];
    expect(calculateBalance(transactions)).toBe(-1000);
  });

  it('should calculate correct balance for multiple transactions', () => {
    const transactions: Transaction[] = [
      { id: '1', type: 'GIVEN', amount: 5000, transaction_date: '2026-08-29' },
      { id: '2', type: 'RECEIVED', amount: 2000, transaction_date: '2026-08-29' },
      { id: '3', type: 'RECEIVED', amount: 1000, transaction_date: '2026-08-29' }
    ];
    expect(calculateBalance(transactions)).toBe(2000);
  });

  it('should handle zero balance (settled)', () => {
    const transactions: Transaction[] = [
      { id: '1', type: 'BORROWED', amount: 3000, transaction_date: '2026-08-29' },
      { id: '2', type: 'RETURNED', amount: 3000, transaction_date: '2026-08-29' }
    ];
    expect(calculateBalance(transactions)).toBe(0);
  });
});

describe('calculateAccountBalance', () => {
  const accountId = 'acc1';
  
  it('should increase on INCOME and decrease on EXPENSE', () => {
    const transactions: Transaction[] = [
      { id: '1', type: 'INCOME', amount: 5000, transaction_date: '2026-08-29', account_id: accountId },
      { id: '2', type: 'EXPENSE', amount: 2000, transaction_date: '2026-08-29', account_id: accountId }
    ];
    expect(calculateAccountBalance(accountId, transactions)).toBe(3000);
  });

  it('should handle Transfers correctly', () => {
    const transactions: Transaction[] = [
      { id: '1', type: 'INCOME', amount: 1000, transaction_date: '2026-08-29', account_id: accountId },
      // Transfer out of this account
      { id: '2', type: 'TRANSFER', amount: 300, transaction_date: '2026-08-29', account_id: accountId, to_account_id: 'acc2' },
      // Transfer into this account
      { id: '3', type: 'TRANSFER', amount: 500, transaction_date: '2026-08-29', account_id: 'acc3', to_account_id: accountId }
    ];
    expect(calculateAccountBalance(accountId, transactions)).toBe(1200); // 1000 - 300 + 500
  });

  it('should handle Lending and Borrowing correctly', () => {
    const transactions: Transaction[] = [
      { id: '1', type: 'INCOME', amount: 5000, transaction_date: '2026-08-29', account_id: accountId },
      { id: '2', type: 'GIVEN', amount: 1000, transaction_date: '2026-08-29', account_id: accountId }, // lent 1000
      { id: '3', type: 'BORROWED', amount: 2000, transaction_date: '2026-08-29', account_id: accountId }, // borrowed 2000
    ];
    expect(calculateAccountBalance(accountId, transactions)).toBe(6000); // 5000 - 1000 + 2000
  });
});

describe('calculateMonthlySummary', () => {
  it('should aggregate monthly stats correctly', () => {
    const transactions: Transaction[] = [
      { id: '1', type: 'INCOME', amount: 5000, transaction_date: '2026-08-05' },
      { id: '2', type: 'EXPENSE', amount: 2000, transaction_date: '2026-08-10' },
      { id: '3', type: 'GIVEN', amount: 1000, transaction_date: '2026-08-15' }, // Not an expense
      { id: '4', type: 'SAVING', amount: 500, transaction_date: '2026-08-20' }, // saving
      { id: '5', type: 'INCOME', amount: 1000, transaction_date: '2026-07-29' } // outside month
    ];

    const summary = calculateMonthlySummary(transactions, '2026-08');
    expect(summary.income).toBe(5000);
    expect(summary.expense).toBe(2000);
    expect(summary.lent).toBe(1000);
    expect(summary.savings).toBe(500);
    expect(summary.remaining).toBe(2500); // 5000 - 2000 - 500
  });
});
