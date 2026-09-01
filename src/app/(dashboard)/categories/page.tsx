import { createClient } from '@/lib/supabase/server';
import { AddCategoryDialog } from '@/components/categories/add-category-dialog';
import { CategoryList } from '@/components/categories/category-list';
import { getDictionary } from '@/i18n/server';

export default async function CategoriesPage() {
  const supabase = await createClient();
  const t = await getDictionary();

  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('name');

  const allCategories = categories || [];
  const incomeCategories = allCategories.filter(c => c.type === 'INCOME');
  const expenseCategories = allCategories.filter(c => c.type === 'EXPENSE');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{t.categories.title}</h2>
          <p className="text-muted-foreground">{t.categories.subtitle}</p>
        </div>
        <AddCategoryDialog />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <h3 className="text-xl font-semibold border-b pb-2">{t.categories.expenseCategory}</h3>
          <CategoryList categories={expenseCategories} />
        </div>
        <div className="space-y-4">
          <h3 className="text-xl font-semibold border-b pb-2">{t.categories.incomeCategory}</h3>
          <CategoryList categories={incomeCategories} />
        </div>
      </div>
    </div>
  );
}
