'use client';

import { useState, useRef, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter, usePathname } from 'next/navigation';
import { createPortal } from 'react-dom';

interface ExpandableFabProps {
  href?: string;
  onClick?: () => void;
  label: string;
  className?: string;
}

export function ExpandableFab({ href, onClick, label, className }: ExpandableFabProps) {
  const [isScrollingDown, setIsScrollingDown] = useState(false);
  const lastScrollY = useRef(0);
  const router = useRouter();
  const pathname = usePathname();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle scroll to hide
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
        setIsScrollingDown(true); // Scrolled down
        lastScrollY.current = currentScrollY;
      } else if (currentScrollY < lastScrollY.current - 2) {
        setIsScrollingDown(false); // Scrolled up
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
  }, [pathname]);

  if (!mounted) return null;

  return createPortal(
    <div 
      className={cn(
        "mobile-fab fixed right-4 z-40 md:hidden flex items-center justify-end transition-transform duration-150 ease-in-out",
        isScrollingDown ? "translate-y-40" : "translate-y-0",
        className
      )}
      style={{ bottom: 'calc(5.5rem + env(safe-area-inset-bottom))' }}
    >
      <button
        type="button"
        onClick={() => {
          if (onClick) {
            onClick();
          } else if (href) {
            router.push(href);
          }
        }}
        className="flex items-center justify-center bg-primary text-primary-foreground rounded-full shadow-xl w-14 h-14 transition-transform active:scale-95"
      >
        <Plus className="h-6 w-6" />
      </button>
    </div>,
    document.body
  );
}
