'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTranslation, Locale } from '@/i18n/client';
import { Languages } from 'lucide-react';

export function LanguageToggle() {
  const { locale, setLocale } = useTranslation();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="outline" size="icon" className="glass-panel w-10 h-10 rounded-full shrink-0 border-primary/20 hover:bg-primary/10 transition-colors" />}>
        <Languages className="h-[1.2rem] w-[1.2rem] text-primary" />
        <span className="sr-only">Toggle language</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="glass-panel">
        <DropdownMenuItem onClick={() => setLocale('en')} className={locale === 'en' ? 'bg-primary/20 font-bold' : ''}>
          English
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setLocale('bn')} className={locale === 'bn' ? 'bg-primary/20 font-bold' : ''}>
          বাংলা
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
