'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Home, Users, ArrowRightLeft, PieChart, Settings, Activity, Target } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ModeToggle } from '@/components/ui/mode-toggle';

const navItems = [
  { label: 'Overview', href: '/dashboard', icon: Home },
  { label: 'Accounts', href: '/accounts', icon: Activity },
  { label: 'Categories', href: '/categories', icon: PieChart },
  { label: 'Budgets', href: '/budgets', icon: Target },
  { label: 'People', href: '/people', icon: Users },
  { label: 'Transactions', href: '/transactions', icon: ArrowRightLeft },
  { label: 'Settings', href: '/settings', icon: Settings },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex h-screen w-full bg-background/50">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r bg-card/50 glass-panel">
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
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <header className="md:hidden h-14 border-b flex items-center justify-between px-4 glass-panel sticky top-0 z-30">
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 p-2 rounded-xl glass-panel">
              <Activity className="w-5 h-5 text-primary" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-primary">Dena Pawna</h1>
          </div>
          <ModeToggle />
        </header>

        <div className="flex-1 overflow-y-auto pb-20 md:pb-0 p-4 md:p-8">
          <div className="max-w-4xl mx-auto">
            {children}
          </div>
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 glass-panel border-t flex items-center justify-around px-2 z-40">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors',
                isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <div className={cn('p-1.5 rounded-full transition-all', isActive && 'bg-primary/10')}>
                <Icon className="h-5 w-5" />
              </div>
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
