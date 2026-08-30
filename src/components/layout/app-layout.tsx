'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Users, ArrowRightLeft, PieChart, Settings, Activity, Target } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ModeToggle } from '@/components/ui/mode-toggle';
import { LanguageToggle } from '@/components/ui/language-toggle';
import { useTranslation } from '@/i18n/client';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { t } = useTranslation();

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

      {/* Mobile Top Header (flex item, doesn't overlap scroll) */}
      <header className="md:hidden h-14 border-b flex items-center justify-between px-4 glass-panel shrink-0 z-20">
        <div className="flex items-center gap-2">
          <div className="bg-primary/10 p-2 rounded-xl glass-panel">
            <Activity className="w-5 h-5 text-primary" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-primary">Dena Pawna</h1>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/settings" className="bg-primary/10 p-2 rounded-full glass-panel hover:bg-primary/20 transition-all border border-primary/20 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
            <Settings className="w-5 h-5 text-primary" />
          </Link>
        </div>
      </header>

      {/* Main Content Area (Scrollable flex area) */}
      <main className="flex-1 min-w-0 overflow-y-auto relative z-10 p-4 md:p-8">
        <div className="max-w-4xl mx-auto pb-4">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation (flex item, doesn't overlap scroll) */}
      <nav className="md:hidden h-16 w-full glass-panel border-t flex items-center justify-around px-2 shrink-0 z-20 pb-safe">
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
  );
}
