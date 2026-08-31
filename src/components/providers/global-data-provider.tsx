'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Person = any; 
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Category = any;

interface GlobalDataContextType {
  people: Person[];
  categories: Category[];
  isLoading: boolean;
  refreshData: () => Promise<void>;
}

const GlobalDataContext = createContext<GlobalDataContextType>({
  people: [],
  categories: [],
  isLoading: true,
  refreshData: async () => {},
});

export function GlobalDataProvider({ children }: { children: React.ReactNode }) {
  const [people, setPeople] = useState<Person[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    try {
      const supabase = createClient();
      const [{ data: pData }, { data: cData }] = await Promise.all([
        supabase.from('people').select('*'),
        supabase.from('categories').select('*'),
      ]);
      setPeople(pData || []);
      setCategories(cData || []);
    } catch (error) {
      console.error('Error fetching global data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <GlobalDataContext.Provider value={{ people, categories, isLoading, refreshData: fetchData }}>
      {children}
    </GlobalDataContext.Provider>
  );
}

export function useGlobalData() {
  return useContext(GlobalDataContext);
}
