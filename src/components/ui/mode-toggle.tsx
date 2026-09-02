'use client';

import * as React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

export function ModeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div className="w-16 h-9 rounded-full glass-panel border border-primary/20 p-1 flex items-center">
        <div className="h-7 w-7 rounded-full bg-primary/20 animate-pulse" />
      </div>
    );
  }

  const isDark = (resolvedTheme || theme) === 'dark';

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="relative flex items-center bg-secondary/50 rounded-full p-1 w-16 h-9 cursor-pointer border border-primary/20 glass-panel focus:outline-none transition-colors overflow-hidden"
      aria-label="Toggle theme"
    >
      {/* Sliding Pill Background */}
      <div
        className={`absolute top-1 bottom-1 w-7 bg-primary rounded-full shadow-md transition-transform duration-300 ease-in-out ${
          isDark ? 'translate-x-7' : 'translate-x-0'
        }`}
      />
      
      <div className={`flex-1 z-10 flex items-center justify-center transition-colors duration-300 ${!isDark ? 'text-primary-foreground font-bold' : 'text-muted-foreground hover:text-foreground'}`}>
        <Sun className="h-4 w-4" />
      </div>
      <div className={`flex-1 z-10 flex items-center justify-center transition-colors duration-300 ${isDark ? 'text-primary-foreground font-bold' : 'text-muted-foreground hover:text-foreground'}`}>
        <Moon className="h-4 w-4" />
      </div>
    </button>
  );
}
