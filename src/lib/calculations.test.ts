import { calculateBalance, Transaction } from './calculations';
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
