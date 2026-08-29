'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, ArrowLeftRight, UserCog } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function AdminNav() {
  const pathname = usePathname();

  const links = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/people', label: 'People', icon: Users },
    { href: '/admin/transactions', label: 'Transactions', icon: ArrowLeftRight },
    { href: '/admin/users', label: 'System Users', icon: UserCog },
  ];

  return (
    <nav className="space-y-1">
      {links.map((link) => {
        const isActive = link.href === '/admin' ? pathname === '/admin' : pathname.startsWith(link.href);
        return (
          <Link key={link.href} href={link.href}>
            <Button 
              variant={isActive ? 'default' : 'ghost'} 
              className={cn("w-full justify-start", !isActive && "text-foreground/80 hover:text-foreground")}
            >
              <link.icon className="mr-2 h-4 w-4" /> {link.label}
            </Button>
          </Link>
        );
      })}
    </nav>
  );
}
