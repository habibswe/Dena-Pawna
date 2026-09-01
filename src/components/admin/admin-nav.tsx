'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, ArrowLeftRight, UserCog, Tags, Wallet, PieChart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function AdminNav() {
  const pathname = usePathname();

  const links = [
    { href: '/super-admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/super-admin/people', label: 'People', icon: Users },
    { href: '/super-admin/transactions', label: 'Transactions', icon: ArrowLeftRight },
    { href: '/super-admin/accounts', label: 'Accounts', icon: Wallet },
    { href: '/super-admin/categories', label: 'Categories', icon: Tags },
    { href: '/super-admin/budgets', label: 'Budgets', icon: PieChart },
    { href: '/super-admin/users', label: 'System Users', icon: UserCog },
  ];

  return (
    <nav className="space-y-2">
      {links.map((link) => {
        const isActive = link.href === '/super-admin' ? pathname === '/super-admin' : pathname.startsWith(link.href);
        return (
          <Link 
            key={link.href} 
            href={link.href}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all w-full',
              isActive
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'
            )}
          >
            <link.icon className="h-4 w-4" /> {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
