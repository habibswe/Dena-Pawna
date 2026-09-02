import { 
  calculateBalance, 
  calculateAccountBalance, 
  calculateTotalWalletBalance, 
  calculateTimeframeSummary, 
  Transaction 
} from './calculations';
import { describe, it, expect } from 'vitest';

describe('Credit/Debt & Double-Entry Calculation Rules', () => {
  const walletA = 'wallet_bank';
  const personJohn = 'person_john';

  it('1. Give Loan (GIVEN): Wallet decreases, Total balance decreases, Person receivable increases', () => {
    const transactions: Transaction[] = [
      { id: '1', type: 'INCOME', amount: 10000, transaction_date: '2026-09-01', account_id: walletA },
      { id: '2', type: 'GIVEN', amount: 3000, transaction_date: '2026-09-02', account_id: walletA, person_id: personJohn }
    ];

    // Wallet A balance decreases by 3,000 (10,000 - 3,000 = 7,000)
    expect(calculateAccountBalance(walletA, transactions)).toBe(7000);
    // Total wallet balance decreases by 3,000
    expect(calculateTotalWalletBalance(transactions)).toBe(7000);
    // Person receivable (পাওনা) is +3,000
    expect(calculateBalance(transactions.filter(t => t.person_id === personJohn))).toBe(3000);
  });

  it('2. Take Loan (BORROWED): Wallet increases, Total balance increases, Person payable increases (negative)', () => {
    const transactions: Transaction[] = [
      { id: '1', type: 'INCOME', amount: 5000, transaction_date: '2026-09-01', account_id: walletA },
      { id: '2', type: 'BORROWED', amount: 4000, transaction_date: '2026-09-02', account_id: walletA, person_id: personJohn }
    ];

    // Wallet A balance increases by 4,000 (5,000 + 4,000 = 9,000)
    expect(calculateAccountBalance(walletA, transactions)).toBe(9000);
    // Total wallet balance increases by 4,000
    expect(calculateTotalWalletBalance(transactions)).toBe(9000);
    // User owes John (দেনা) is -4,000
    expect(calculateBalance(transactions.filter(t => t.person_id === personJohn))).toBe(-4000);
  });

  it('3. Receive Loan Payment (RECEIVED): Wallet increases, Total balance increases, Person receivable decreases', () => {
    const transactions: Transaction[] = [
      { id: '1', type: 'INCOME', amount: 10000, transaction_date: '2026-09-01', account_id: walletA },
      // Gave loan 5,000
      { id: '2', type: 'GIVEN', amount: 5000, transaction_date: '2026-09-02', account_id: walletA, person_id: personJohn },
      // John returns 2,000
      { id: '3', type: 'RECEIVED', amount: 2000, transaction_date: '2026-09-03', account_id: walletA, person_id: personJohn }
    ];

    // Wallet A balance: 10,000 - 5,000 + 2,000 = 7,000
    expect(calculateAccountBalance(walletA, transactions)).toBe(7000);
    // Total wallet balance: 7,000
    expect(calculateTotalWalletBalance(transactions)).toBe(7000);
    // Remaining receivable from John is 3,000 (+5,000 - 2,000)
    expect(calculateBalance(transactions.filter(t => t.person_id === personJohn))).toBe(3000);
  });

  it('4. Repay Loan (RETURNED): Wallet decreases, Total balance decreases, Person payable decreases', () => {
    const transactions: Transaction[] = [
      // Borrowed 6,000
      { id: '1', type: 'BORROWED', amount: 6000, transaction_date: '2026-09-01', account_id: walletA, person_id: personJohn },
      // Repay 2,500
      { id: '2', type: 'RETURNED', amount: 2500, transaction_date: '2026-09-02', account_id: walletA, person_id: personJohn }
    ];

    // Wallet A balance: +6,000 - 2,500 = 3,500
    expect(calculateAccountBalance(walletA, transactions)).toBe(3500);
    // Total wallet balance: 3,500
    expect(calculateTotalWalletBalance(transactions)).toBe(3500);
    // Remaining debt to John is -3,500 (-6,000 + 2,500)
    expect(calculateBalance(transactions.filter(t => t.person_id === personJohn))).toBe(-3500);
  });

  it('5. Monthly timeframe net cash flow aggregates loans, repayments, income and expenses correctly', () => {
    const transactions: Transaction[] = [
      { id: '1', type: 'INCOME', amount: 20000, transaction_date: '2026-09-01' },
      { id: '2', type: 'EXPENSE', amount: 5000, transaction_date: '2026-09-02' },
      { id: '3', type: 'GIVEN', amount: 4000, transaction_date: '2026-09-03' },
      { id: '4', type: 'BORROWED', amount: 3000, transaction_date: '2026-09-04' },
      { id: '5', type: 'RECEIVED', amount: 1000, transaction_date: '2026-09-05' },
      { id: '6', type: 'RETURNED', amount: 1500, transaction_date: '2026-09-06' },
      { id: '7', type: 'SAVING', amount: 2000, transaction_date: '2026-09-07' }
    ];

    const summary = calculateTimeframeSummary(transactions, '2026-09');
    // Total In: 20,000 (inc) + 3,000 (borrowed) + 1,000 (repayments received) = 24,000
    expect(summary.totalIn).toBe(24000);
    // Total Out: 5,000 (exp) + 2,000 (saving) + 4,000 (lent) + 1,500 (repayments sent) = 12,500
    expect(summary.totalOut).toBe(12500);
    // Net remaining cash flow: 24,000 - 12,500 = 11,500
    expect(summary.remaining).toBe(11500);
  });

  it('6. Opening Balance: Correctly factors opening payable and receivable without past transactions', () => {
    // Contact with initial payable (I owe them 5,000)
    const personPayable = { id: 'p1', name: 'Bkash Loan', opening_balance: 5000, opening_balance_type: 'PAYABLE' };
    expect(calculateBalance([], personPayable)).toBe(-5000);

    // Contact with initial receivable (They owe me 7,000)
    const personReceivable = { id: 'p2', name: 'Karim', opening_balance: 7000, opening_balance_type: 'RECEIVABLE' };
    expect(calculateBalance([], personReceivable)).toBe(7000);

    // Repay 5,000 of the opening payable debt -> Settles to 0
    const repaymentTx: Transaction[] = [
      { id: '1', type: 'RETURNED', amount: 5000, transaction_date: '2026-09-02', person_id: 'p1' }
    ];
    expect(calculateBalance(repaymentTx, personPayable)).toBe(0);
  });

  it('7. Smart Repayment Guard: Orphan repayment without previous borrowing history settles to 0 (never flips to positive)', () => {
    // User repays 5,500 to a contact where no prior borrowing was logged
    const orphanRepayment: Transaction[] = [
      { id: '1', type: 'RETURNED', amount: 5500, transaction_date: '2026-09-01', person_id: 'p_orphan' }
    ];

    // Must be 0 (Settled), NOT +5500
    expect(calculateBalance(orphanRepayment)).toBe(0);
  });
});
