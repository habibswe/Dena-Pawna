'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

type DataContextType = {
  people: any[];
  categories: any[];
  isLoading: boolean;
  refresh: () => Promise<void>;
};

const DataContext = createContext<DataContextType>({
  people: [],
  categories: [],
  isLoading: true,
  refresh: async () => {},
});

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [people, setPeople] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  const fetchData = async () => {
    setIsLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const [peopleRes, categoriesRes] = await Promise.all([
        supabase.from('people').select('id, name'),
        supabase.from('categories').select('id, name')
      ]);
      setPeople(peopleRes.data || []);
      setCategories(categoriesRes.data || []);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <DataContext.Provider value={{ people, categories, isLoading, refresh: fetchData }}>
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => useContext(DataContext);
