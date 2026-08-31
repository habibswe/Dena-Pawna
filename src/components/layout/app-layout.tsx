'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Users, ArrowRightLeft, PieChart, Settings, Activity, Target } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ModeToggle } from '@/components/ui/mode-toggle';
import { LanguageToggle } from '@/components/ui/language-toggle';
import { NotificationBell } from '@/components/layout/notification-bell';
import { useTranslation } from '@/i18n/client';
import { useState, useEffect, useRef } from 'react';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { t } = useTranslation();
  
  const [isScrollingDown, setIsScrollingDown] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = (e: Event) => {
      const target = e.target as HTMLElement;
      const currentScrollY = target.scrollTop;
      
      // Always show at the very top (within 20px)
      if (currentScrollY <= 20) {
        setIsScrollingDown(false);
        lastScrollY.current = currentScrollY;
        return;
      }

      // Hide when scrolling down, show immediately when scrolling up
      if (currentScrollY > lastScrollY.current + 5) {
        setIsScrollingDown(true); // Scrolled down (hide)
        lastScrollY.current = currentScrollY;
      } else if (currentScrollY < lastScrollY.current - 2) {
        setIsScrollingDown(false); // Scrolled up (show immediately)
        lastScrollY.current = currentScrollY;
      }
    };

    const container = document.getElementById('main-scroll-container');
    if (container) {
      container.addEventListener('scroll', handleScroll, { passive: true });
    }
    
    return () => {
      if (container) {
        container.removeEventListener('scroll', handleScroll);
      }
    };
  }, [pathname]); // Re-run effect if pathname changes just in case container resets

  const navItems = [
    { label: t.nav.overview, href: '/dashboard', icon: Home },
    { label: t.nav.accounts, href: '/accounts', icon: Activity },
    { label: t.nav.categories, href: '/categories', icon: PieChart },
    { label: t.nav.budgets, href: '/budgets', icon: Target },
    { label: t.nav.people, href: '/people', icon: Users },
    { label: t.nav.transactions, href: '/transactions', icon: ArrowRightLeft },
    { label: t.nav.settings, href: '/settings', icon: Settings },
  ];

  return (
    <div className="flex flex-col md:flex-row h-[100dvh] w-full bg-transparent">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r bg-background/60 glass-panel z-20">
        <div className="p-6 h-16 flex items-center gap-3">
          <div className="bg-primary/10 p-2 rounded-xl glass-panel">
            <Activity className="w-5 h-5 text-primary" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-primary">Dena Pawna</h1>
        </div>
        <nav className="flex-1 space-y-2 p-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-border/40 flex items-center justify-between gap-2">
          {/* <LanguageToggle /> */}
          {/* <ModeToggle /> */}
        </div>
      </aside>

      {/* Mobile Top Header (Fixed and hides on scroll) */}
      <header className={cn(
        "md:hidden fixed top-0 left-0 right-0 h-14 border-b flex items-center justify-between px-4 shrink-0 z-30 transition-transform duration-300 ease-in-out bg-background/95 backdrop-blur-md",
        isScrollingDown ? "-translate-y-full" : "translate-y-0"
      )}>
        <div className="flex items-center gap-2">
          <div className="bg-primary/10 p-2 rounded-xl glass-panel">
            <Activity className="w-5 h-5 text-primary" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-primary">Dena Pawna</h1>
        </div>
        <div className="flex items-center gap-2">
          <NotificationBell />
          <Link href="/settings" className="bg-primary/10 p-2 rounded-full glass-panel hover:bg-primary/20 transition-all border border-primary/20 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
            <Settings className="w-5 h-5 text-primary" />
          </Link>
        </div>
      </header>

      {/* Main Content Area (Scrollable flex area) */}
      <main id="main-scroll-container" className="flex-1 min-w-0 overflow-y-auto relative z-10 p-4 md:p-8 pt-20 pb-28 md:pt-8 md:pb-8">
        <div className="hidden md:flex justify-end mb-4">
          <NotificationBell />
        </div>
        <div className="max-w-4xl mx-auto">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation (Floating Pill Overlay) */}
      <div 
        className="md:hidden fixed bottom-0 left-0 right-0 w-full px-4 z-40 pointer-events-none"
        style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom))' }}
      >
        <nav className="h-16 w-full glass-panel bg-background/85 backdrop-blur-xl border flex items-center justify-around px-2 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] pointer-events-auto">
          {navItems.filter(item => item.href !== '/settings').map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors',
                  isActive ? 'text-primary' : 'text-foreground hover:text-primary/80'
                )}
              >
                <div className={cn('p-1.5 rounded-full transition-all', isActive && 'bg-primary/10')}>
                  <Icon className={cn("h-5 w-5", isActive && "stroke-[2.5px]")} />
                </div>
                <span className={cn("text-[10px]", isActive ? "font-bold" : "font-medium")}>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
