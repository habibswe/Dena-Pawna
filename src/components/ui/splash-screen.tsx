'use client';

import { useEffect, useState } from 'react';
import { Activity } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/i18n/client';

export function SplashScreen() {
  const [isVisible, setIsVisible] = useState(true);
  const [isFading, setIsFading] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    // Check if running as a PWA (standalone mode)
    const isPWA = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true;
    
    // Check if splash screen was already shown in this session
    const hasSeenSplash = sessionStorage.getItem('hasSeenSplash');
    
    if (!isPWA || hasSeenSplash) {
      setIsVisible(false);
      return;
    }

    // Hide splash screen after minimum display time
    const timer = setTimeout(() => {
      setIsFading(true);
      setTimeout(() => {
        setIsVisible(false);
        sessionStorage.setItem('hasSeenSplash', 'true');
      }, 500); // Wait for fade out animation
    }, 2000); // Show for 2 seconds

    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div 
      className={cn(
        "fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background transition-opacity duration-500",
        isFading ? "opacity-0" : "opacity-100"
      )}
    >
      <style dangerouslySetInnerHTML={{__html: `
        @media all and (not (display-mode: standalone)) {
          .splash-screen { display: none !important; }
        }
      `}} />
      {/* Background gradients matching the theme */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-secondary/20 dark:to-primary/10" />
        <div className="absolute top-[20%] left-[20%] w-[60vw] h-[60vw] bg-primary rounded-full blur-[100px] opacity-40 dark:opacity-20 animate-pulse" style={{ animationDuration: '4s' }} />
        <div className="absolute bottom-[20%] right-[20%] w-[50vw] h-[50vw] bg-emerald-400 dark:bg-emerald-800 rounded-full blur-[120px] opacity-30 dark:opacity-20 animate-pulse" style={{ animationDuration: '6s', animationDelay: '1s' }} />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-8 glass-panel p-12 rounded-3xl animate-in zoom-in-95 duration-1000 shadow-2xl">
        <div className="bg-primary/20 p-6 rounded-3xl glass-panel animate-bounce" style={{ animationDuration: '2s' }}>
          <Activity className="w-20 h-20 text-primary drop-shadow-lg" strokeWidth={2.5} />
        </div>
        <div className="flex flex-col items-center gap-2">
          <h1 className="text-4xl font-extrabold tracking-tight text-primary drop-shadow-md">
            {t.common.appTitle}
          </h1>
          <p className="text-muted-foreground font-medium animate-pulse tracking-wide">
            Your Premium Ledger
          </p>
        </div>
      </div>
    </div>
  );
}
