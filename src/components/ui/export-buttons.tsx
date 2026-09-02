'use client';

import { useState } from 'react';
import { Download, FileText, FileSpreadsheet, Loader2, ChevronDown } from 'lucide-react';
import { exportToCSV, exportToExcel, exportToPDF, Person } from '@/lib/exportUtils';
import { Transaction } from '@/lib/calculations';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { buttonVariants } from '@/components/ui/button';

export function ExportButtons({ transactions, people }: { transactions: Transaction[], people: Person[] }) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async (type: 'csv' | 'excel' | 'pdf') => {
    if (transactions.length === 0) {
      toast.error('No transactions to export in this date range.');
      return;
    }

    setIsExporting(true);
    try {
      // Small timeout to allow UI to update (spinner) before blocking main thread with heavy export logic
      await new Promise(resolve => setTimeout(resolve, 50));
      if (type === 'csv') exportToCSV(transactions, people);
      if (type === 'excel') exportToExcel(transactions, people);
      if (type === 'pdf') exportToPDF(transactions, people);
      toast.success(`Exported to ${type.toUpperCase()} successfully!`);
    } catch (error) {
      toast.error(`Failed to export to ${type.toUpperCase()}.`);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className={buttonVariants({ variant: "outline", size: "default", className: "glass-panel h-10 text-sm font-medium border-primary/20" })} disabled={isExporting}>
        {isExporting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
        Export <ChevronDown className="ml-2 h-3 w-3 opacity-50" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="glass-panel">
        <DropdownMenuItem onClick={() => handleExport('pdf')} className="cursor-pointer">
          <Download className="mr-2 h-4 w-4 text-muted-foreground" />
          <span>PDF</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('excel')} className="cursor-pointer">
          <FileSpreadsheet className="mr-2 h-4 w-4 text-muted-foreground" />
          <span>Excel</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('csv')} className="cursor-pointer">
          <FileText className="mr-2 h-4 w-4 text-muted-foreground" />
          <span>CSV</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
