'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function ExpenseBreakdown({ 
  transactions,
  categories 
}: { 
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transactions: any[],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  categories: any[]
}) {
  const expenseTxs = transactions.filter(tx => tx.type === 'EXPENSE');
  
  if (expenseTxs.length === 0) {
    return (
      <Card className="glass-panel h-full">
        <CardHeader>
          <CardTitle>Expense Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-48 text-muted-foreground text-sm">
          No expenses this month.
        </CardContent>
      </Card>
    );
  }

  const categoryTotals: Record<string, number> = {};
  let totalExpense = 0;

  expenseTxs.forEach(tx => {
    const amount = Number(tx.amount);
    const catId = tx.category_id || 'uncategorized';
    categoryTotals[catId] = (categoryTotals[catId] || 0) + amount;
    totalExpense += amount;
  });

  const sortedCategories = Object.keys(categoryTotals).sort((a, b) => categoryTotals[b] - categoryTotals[a]);

  return (
    <Card className="glass-panel h-full">
      <CardHeader>
        <CardTitle>Expense Breakdown</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {sortedCategories.map(catId => {
          const total = categoryTotals[catId];
          const percentage = ((total / totalExpense) * 100).toFixed(0);
          const catName = catId === 'uncategorized' ? 'Uncategorized' : categories.find(c => c.id === catId)?.name || 'Unknown';
          
          return (
            <div key={catId} className="space-y-1">
              <div className="flex justify-between text-sm font-medium">
                <span>{catName}</span>
                <span>৳{total.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-full bg-secondary overflow-hidden rounded-full flex-1">
                  <div 
                    className="h-full bg-primary" 
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-xs text-muted-foreground w-8 text-right">{percentage}%</span>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
