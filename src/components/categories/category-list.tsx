'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Tag, MoreVertical, Edit, Trash2 } from 'lucide-react';
import * as Icons from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { deleteCategory } from '@/app/(dashboard)/categories/actions';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { EditCategoryDialog } from './edit-category-dialog';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

interface Category {
  id: string;
  name: string;
  type: string;
  icon: string | null;
}

import { useTranslation } from '@/i18n/client';

export function CategoryList({ categories: initialCategories }: { categories: Category[] }) {
  const { t } = useTranslation();
  const [categories, setCategories] = useState(initialCategories);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setCategories(initialCategories);
  }, [initialCategories]);

  const handleDelete = async () => {
    if (!deletingId) return;
    setIsDeleting(true);
    const result = await deleteCategory(deletingId);
    
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Category deleted successfully");
      setCategories(prev => prev.filter(c => c.id !== deletingId));
      setDeletingId(null);
      router.refresh();
    }
    setIsDeleting(false);
  };

  if (categories.length === 0) {
    return (
      <Card className="glass-panel border-dashed text-center py-8">
        <CardContent className="pt-6">
          <Tag className="mx-auto h-8 w-8 text-muted-foreground/50 mb-3" />
          <h3 className="text-sm font-medium text-muted-foreground">No categories</h3>
        </CardContent>
      </Card>
    );
  }

  const renderIcon = (iconName: string | null) => {
    if (!iconName) return <Tag className="h-5 w-5" />;
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const IconComponent = (Icons as any)[iconName];
    if (!IconComponent) return <Tag className="h-5 w-5" />;
    
    return <IconComponent className="h-5 w-5" />;
  };

  return (
    <div className="flex flex-col gap-2">
      {categories.map((cat) => (
        <div key={cat.id} className="flex items-center gap-3 p-3 rounded-lg glass-panel hover:bg-card/60 transition-colors">
          <div className={`p-2 rounded-lg bg-background shadow-sm border ${cat.type === 'EXPENSE' ? 'text-destructive' : 'text-primary'}`}>
            {renderIcon(cat.icon)}
          </div>
          <span className="font-medium flex-1">{cat.name}</span>
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="h-8 w-8" />}>
              <MoreVertical className="h-4 w-4 text-muted-foreground" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setEditingCategory(cat)}>
                <Edit className="mr-2 h-4 w-4" />
                {t.common.edit}
              </DropdownMenuItem>
              <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => setDeletingId(cat.id)}>
                <Trash2 className="mr-2 h-4 w-4" />
                {t.common.delete}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ))}
      
      {editingCategory && (
        <EditCategoryDialog 
          category={editingCategory} 
          open={!!editingCategory} 
          onOpenChange={(open) => {
            if (!open) {
              setEditingCategory(null);
              router.refresh();
            }
          }} 
        />
      )}

      <ConfirmDialog
        isOpen={!!deletingId}
        onClose={() => !isDeleting && setDeletingId(null)}
        onConfirm={handleDelete}
        title={t.categories.deleteTitle}
        description={t.categories.deleteDesc}
        isDeleting={isDeleting}
      />
    </div>
  );
}
