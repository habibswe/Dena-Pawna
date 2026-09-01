import Link from 'next/link';
import { Activity } from 'lucide-react';
import { ModeToggle } from '@/components/ui/mode-toggle';
import { LanguageToggle } from '@/components/ui/language-toggle';

import { getDictionary } from '@/i18n/server';

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const dict = await getDictionary();
  return (
    <div className="relative min-h-[100dvh] w-full flex flex-col bg-transparent">
      {/* Floating Glass Navbar (Responsive) */}
      <header className="absolute top-0 left-0 w-full max-w-5xl mx-auto p-4 z-50 md:mt-4">
        <div className="glass-panel rounded-full px-4 sm:px-6 py-2 sm:py-3 flex items-center justify-between border-primary/20 bg-background/40 backdrop-blur-3xl shadow-xl">
          <Link href="/" className="flex items-center gap-2 sm:gap-3 hover:opacity-80 transition-opacity">
            <div className="bg-primary/20 p-1.5 sm:p-2 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.3)]">
              <Activity className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
            </div>
            <span className="font-extrabold text-lg sm:text-xl tracking-tight text-primary">{dict.common.appTitle}</span>
          </Link>
          <div className="flex items-center gap-2">
            <LanguageToggle />
            <ModeToggle />
          </div>
        </div>
      </header>
      
      {/* Page Content */}
      <main className="flex-1 flex flex-col relative pt-20">
        {children}
      </main>
    </div>
  );
}
