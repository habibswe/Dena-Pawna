import * as xlsx from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Transaction } from './calculations';

export interface Person {
  id: string;
  name: string;
  [key: string]: unknown;
}

export interface FormattedTransaction {
  Date: string;
  Person: string;
  Type: string;
  Amount: number;
  Note: string;
  [key: string]: string | number;
}

export function formatTransactions(transactions: Transaction[], people: Person[]): FormattedTransaction[] {
  return transactions.map(tx => {
    const person = people.find(p => p.id === tx.person_id);
    return {
      'Date': new Date(tx.transaction_date).toLocaleDateString(),
      'Person': person ? person.name : 'Unknown',
      'Type': tx.type,
      'Amount': Number(tx.amount),
      'Note': tx.note || ''
    };
  });
}

export function exportToCSV(transactions: Transaction[], people: Person[]) {
  const data = formatTransactions(transactions, people);
  if (data.length === 0) return;
  
  const headers = Object.keys(data[0]) as (keyof FormattedTransaction)[];
  const csvRows: string[] = [];
  csvRows.push(headers.join(','));
  
  for (const row of data) {
    const values = headers.map(header => {
      const escaped = ('' + row[header]).replace(/"/g, '\\"');
      return `"${escaped}"`;
    });
    csvRows.push(values.join(','));
  }
  
  const csvString = csvRows.join('\n');
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', 'transactions.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportToExcel(transactions: Transaction[], people: Person[]) {
  const data = formatTransactions(transactions, people);
  const worksheet = xlsx.utils.json_to_sheet(data);
  const workbook = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(workbook, worksheet, 'Transactions');
  xlsx.writeFile(workbook, 'transactions.xlsx');
}

export function exportToPDF(transactions: Transaction[], people: Person[]) {
  const data = formatTransactions(transactions, people);
  if (data.length === 0) return;
  
  const doc = new jsPDF();
  doc.text('Transaction History', 14, 15);
  
  const headers = Object.keys(data[0]) as (keyof FormattedTransaction)[];
  const rows = data.map(row => headers.map(h => String(row[h])));
  
  autoTable(doc, {
    head: [headers],
    body: rows,
    startY: 20
  });
  
  doc.save('transactions.pdf');
}
