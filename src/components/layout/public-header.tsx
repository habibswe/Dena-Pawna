import Link from 'next/link';
import { Activity } from 'lucide-react';
import { ModeToggle } from '@/components/ui/mode-toggle';
import { LanguageToggle } from '@/components/ui/language-toggle';
import { getDictionary } from '@/i18n/server';

export async function PublicHeader() {
  const t = await getDictionary();

  return (
    <header className="w-full max-w-5xl mx-auto p-4 relative z-50 mt-4 md:mt-8">
      <div className="glass-panel rounded-full px-6 py-3 flex items-center justify-between border-primary/20 bg-background/40 backdrop-blur-3xl shadow-xl">
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="bg-primary/20 p-2 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.3)]">
            <Activity className="w-6 h-6 text-primary" />
          </div>
          <span className="font-extrabold text-xl tracking-tight text-primary">{t.landing.title}</span>
        </Link>
        <div className="flex items-center gap-2 md:gap-4">
          <div className="flex items-center gap-2 mr-1 md:mr-2">
            <LanguageToggle />
            <ModeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
