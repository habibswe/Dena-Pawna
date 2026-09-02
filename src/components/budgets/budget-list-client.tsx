'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Target, AlertCircle, MoreVertical, Edit, Trash2, Repeat } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { deleteBudget } from '@/app/(dashboard)/budgets/actions';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { EditBudgetDialog } from './edit-budget-dialog';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

import { useTranslation } from '@/i18n/client';

export function BudgetListClient({ 
  initialBudgets, 
  categories, 
  categorySpent 
}: { 
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialBudgets: any[], 
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  categories: any[],
  categorySpent: Record<string, number>
}) {
  const { t } = useTranslation();
  const [budgets, setBudgets] = useState(initialBudgets);
  const [editingBudget, setEditingBudget] = useState<any | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setBudgets(initialBudgets);
  }, [initialBudgets]);

  const handleDelete = async () => {
    if (!deletingId) return;
    setIsDeleting(true);
    const result = await deleteBudget(deletingId);
    
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Budget deleted successfully");
      setBudgets(prev => prev.filter(b => b.id !== deletingId));
      setDeletingId(null);
      router.refresh();
    }
    setIsDeleting(false);
  };

  if (budgets.length === 0) {
    return (
      <Card className="glass-panel border-dashed col-span-full text-center py-12">
         <CardContent>
           <Target className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
           <h3 className="text-lg font-medium">No budgets set</h3>
           <p className="text-sm text-muted-foreground mt-1">
             Set up a budget to control your spending.
           </p>
         </CardContent>
      </Card>
    );
  }

  return (
    <>
      {budgets.map(budget => {
        const category = categories.find(c => c.id === budget.category_id);
        if (!category) return null;
        
        const spent = categorySpent[category.id] || 0;
        const limit = Number(budget.amount);
        const percentage = Math.min((spent / limit) * 100, 100).toFixed(0);
        const isExceeded = spent > limit;
        const remaining = limit - spent;

        const budgetWithCategory = { ...budget, categories: category };

        return (
          <Card key={budget.id} className={`glass-panel ${isExceeded ? 'border-destructive/50 bg-destructive/5' : ''}`}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex justify-between items-center">
                <div className="flex items-center gap-2 flex-wrap">
                  <span>{category.name}</span>
                  {budget.is_default && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                      <Repeat className="h-3 w-3" />
                      {t.budgets.defaultBadge}
                    </span>
                  )}
                  {isExceeded && <AlertCircle className="h-4 w-4 text-destructive" />}
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="h-8 w-8 -mr-2" />}>
                    <MoreVertical className="h-4 w-4 text-muted-foreground" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setEditingBudget(budgetWithCategory)}>
                      <Edit className="mr-2 h-4 w-4" />
                      {t.common.edit}
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => setDeletingId(budget.id)}>
                      <Trash2 className="mr-2 h-4 w-4" />
                      {t.common.delete}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-sm">
                <div className="space-y-1">
                  <p className="text-muted-foreground">{t.budgets.title}</p>
                  <p className="font-medium">৳{limit.toLocaleString()}</p>
                </div>
                <div className="space-y-1 text-right">
                  <p className="text-muted-foreground">{t.budgets.spent}</p>
                  <p className={`font-bold ${isExceeded ? 'text-destructive' : 'text-primary'}`}>৳{spent.toLocaleString()}</p>
                </div>
              </div>

              <div className="space-y-1">
                <div className="h-2 w-full bg-secondary overflow-hidden rounded-full">
                  <div 
                    className={`h-full ${isExceeded ? 'bg-destructive' : 'bg-primary'}`} 
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{percentage}% used</span>
                  <span>
                    {isExceeded 
                      ? `${t.budgets.overBudget}: ৳${Math.abs(remaining).toLocaleString()}` 
                      : `৳${remaining.toLocaleString()} ${t.budgets.remaining}`
                    }
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}

      {editingBudget && (
        <EditBudgetDialog 
          budget={editingBudget} 
          open={!!editingBudget} 
          onOpenChange={(open) => {
            if (!open) {
              setEditingBudget(null);
              router.refresh();
            }
          }} 
        />
      )}

      <ConfirmDialog
        isOpen={!!deletingId}
        onClose={() => !isDeleting && setDeletingId(null)}
        onConfirm={handleDelete}
        title={t.budgets.deleteTitle}
        description={t.budgets.deleteDesc}
        isDeleting={isDeleting}
      />
    </>
  );
}
