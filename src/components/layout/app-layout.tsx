'use client';

import React from 'react';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Users, ArrowRightLeft, PieChart, Settings, Activity, Target, Plus, Menu, X, Sun, Moon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ModeToggle } from '@/components/ui/mode-toggle';
import { LanguageToggle } from '@/components/ui/language-toggle';
import { NotificationBell } from '@/components/layout/notification-bell';
import { useTranslation } from '@/i18n/client';
import { useState, useEffect, useRef } from 'react';
import { useTheme } from 'next-themes';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { t, locale, setLocale } = useTranslation();
  const { theme, setTheme } = useTheme();
  
  const [isScrollingDown, setIsScrollingDown] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close the more menu whenever the user navigates
  useEffect(() => {
    setIsMoreMenuOpen(false);
  }, [pathname]);

  // Hide the mobile FAB when the "More" menu is open
  useEffect(() => {
    if (isMoreMenuOpen) {
      document.body.classList.add('hide-mobile-fab');
    } else {
      document.body.classList.remove('hide-mobile-fab');
    }
    
    // Cleanup on unmount
    return () => {
      document.body.classList.remove('hide-mobile-fab');
    };
  }, [isMoreMenuOpen]);

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
    { label: t.dashboard.addTransaction, mobileLabel: locale === 'bn' ? 'নতুন' : 'New', href: '/transactions/new', icon: Plus },
    { label: t.nav.transactions, href: '/transactions', icon: ArrowRightLeft },
    { label: t.nav.settings, href: '/settings', icon: Settings },
  ];

  return (
    <div className="flex flex-col md:flex-row h-[100dvh] w-full bg-transparent">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r bg-background/60 glass-panel z-20">
        <Link href="/dashboard" className="p-6 h-16 flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="bg-primary/10 p-2 rounded-xl glass-panel">
            <Activity className="w-5 h-5 text-primary" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-primary">Dena Pawna</h1>
        </Link>
        <nav className="flex-1 space-y-2 p-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            let isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            
            if (item.href === '/transactions') {
              // Transactions shouldn't be active if we are on /transactions/new
              isActive = pathname === '/transactions' || (pathname.startsWith('/transactions') && !pathname.includes('/new') && !pathname.includes('/edit'));
            }

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
        "md:hidden fixed top-0 left-0 right-0 h-14 border-b flex items-center justify-between px-4 shrink-0 z-40 transition-transform duration-300 ease-in-out bg-background/95 backdrop-blur-md",
        isScrollingDown ? "-translate-y-full" : "translate-y-0"
      )}>
        <Link href="/dashboard" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="bg-primary/10 p-2 rounded-xl glass-panel">
            <Activity className="w-5 h-5 text-primary" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-primary">Dena Pawna</h1>
        </Link>
        <div className="flex items-center gap-2">
          <NotificationBell />
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
        <nav className="h-16 w-full glass-panel bg-background/85 backdrop-blur-xl border flex items-center justify-around px-2 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] pointer-events-auto relative z-50">
          {navItems.filter(item => ['/dashboard', '/accounts', '/transactions/new', '/transactions'].includes(item.href)).map((item) => {
            const Icon = item.icon;
            let isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            if (item.href === '/transactions') {
              // Transactions shouldn't be active if we are on /transactions/new
              isActive = pathname === '/transactions' || (pathname.startsWith('/transactions') && !pathname.includes('/new') && !pathname.includes('/edit'));
            }
            
            const isNewBtn = item.href === '/transactions/new';
            
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMoreMenuOpen(false)}
                className="flex flex-col items-center justify-center w-[20%] h-full"
              >
                {isNewBtn ? (
                  <div className="flex flex-col items-center justify-center bg-primary text-primary-foreground rounded-full aspect-square h-[85%] shadow-md active:scale-95 transition-transform">
                    <Icon className="h-5 w-5 stroke-[2.5px]" />
                    <span className="text-[8px] font-bold mt-0.5">
                      {'mobileLabel' in item ? item.mobileLabel : item.label}
                    </span>
                  </div>
                ) : (
                  <>
                    <div className={cn('p-1.5 rounded-full transition-all', isActive && 'bg-primary/10')}>
                      <Icon className={cn("h-5 w-5", isActive ? "text-primary stroke-[2.5px]" : "text-foreground")} />
                    </div>
                    <span className={cn("text-[9px] sm:text-[10px] mt-0.5", isActive ? "text-primary font-bold" : "text-foreground font-medium")}>
                      {'mobileLabel' in item ? item.mobileLabel : item.label}
                    </span>
                  </>
                )}
              </Link>
            );
          })}
          
          {/* More Menu Button */}
          <button
            onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
            className={cn(
              'flex flex-col items-center justify-center w-[20%] h-full space-y-1 transition-colors',
              isMoreMenuOpen ? 'text-primary' : 'text-foreground hover:text-primary/80'
            )}
          >
            <div className={cn('p-1.5 rounded-full transition-all', isMoreMenuOpen && 'bg-primary/10')}>
              {isMoreMenuOpen ? (
                <X className="h-5 w-5 stroke-[2.5px]" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </div>
            <span className={cn("text-[9px] sm:text-[10px]", isMoreMenuOpen ? "font-bold" : "font-medium")}>
              More
            </span>
          </button>
        </nav>
      </div>

      {/* Mobile "More" Fullscreen Overlay Menu */}
      <div 
        className={cn(
          "md:hidden fixed inset-0 z-30 bg-background/95 backdrop-blur-xl transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] flex flex-col",
          isMoreMenuOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-[100%] pointer-events-none"
        )}
        style={{ paddingBottom: 'calc(6rem + env(safe-area-inset-bottom))' }} // Leave space for bottom nav
      >
        <div className="flex-1 overflow-y-auto px-6 py-12 pt-20">
          <div className="mb-8">
            <h2 className="text-3xl font-bold tracking-tight">Menu</h2>
            <p className="text-muted-foreground mt-1">Access all features and settings</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {navItems.filter(item => !['/dashboard', '/accounts', '/transactions/new', '/transactions'].includes(item.href)).map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex flex-col items-center justify-center gap-3 p-6 glass-panel rounded-2xl active:scale-95 transition-transform"
                >
                  <div className="bg-primary/10 p-4 rounded-full">
                    <Icon className="h-8 w-8 text-primary" />
                  </div>
                  <span className="font-semibold text-sm">{item.label}</span>
                </Link>
              );
            })}
          </div>
          
          <div className="mt-8 pt-8 border-t border-border/50">
             <div className="flex flex-col gap-6">
                <div className="space-y-3">
                  <span className="font-medium text-sm block">Dark Mode</span>
                  <div 
                    className="relative flex items-center bg-secondary/50 rounded-full p-1 w-full cursor-pointer border border-border"
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  >
                    {/* Sliding Pill Background */}
                    <div 
                      className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-primary rounded-full shadow-md transition-transform duration-300 ease-in-out ${
                        (mounted && theme === 'dark') ? 'translate-x-[calc(100%+4px)]' : 'translate-x-0'
                      }`} 
                    />
                    
                    <div className={`flex-1 text-center z-10 flex items-center justify-center py-2.5 text-sm font-medium transition-colors ${!(mounted && theme === 'dark') ? 'text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
                      <Sun className="h-4 w-4 mr-2" /> Light
                    </div>
                    <div className={`flex-1 text-center z-10 flex items-center justify-center py-2.5 text-sm font-medium transition-colors ${(mounted && theme === 'dark') ? 'text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
                      <Moon className="h-4 w-4 mr-2" /> Dark
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <span className="font-medium text-sm block">Language / ভাষা</span>
                  <div 
                    className="relative flex items-center bg-secondary/50 rounded-full p-1 w-full cursor-pointer border border-border"
                    onClick={() => setLocale(locale === 'en' ? 'bn' : 'en')}
                  >
                    {/* Sliding Pill Background */}
                    <div 
                      className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-primary rounded-full shadow-md transition-transform duration-300 ease-in-out ${
                        locale === 'bn' ? 'translate-x-[calc(100%+4px)]' : 'translate-x-0'
                      }`} 
                    />
                    
                    <div className={`flex-1 text-center z-10 flex items-center justify-center py-2.5 text-sm font-medium transition-colors ${locale === 'en' ? 'text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
                      English
                    </div>
                    <div className={`flex-1 text-center z-10 flex items-center justify-center py-2.5 text-sm font-medium transition-colors ${locale === 'bn' ? 'text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
                      বাংলা
                    </div>
                  </div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
