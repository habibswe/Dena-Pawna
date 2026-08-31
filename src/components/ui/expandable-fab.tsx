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
  const [isExpanded, setIsExpanded] = useState(false);
  const [isScrollingDown, setIsScrollingDown] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastScrollY = useRef(0);
  const router = useRouter();
  const pathname = usePathname();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle clicking outside to collapse

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsExpanded(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
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
        setIsExpanded(false); // Also collapse if expanded
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
      ref={containerRef}
      className={cn(
        "fixed right-4 z-[100] md:hidden flex items-center justify-end pointer-events-none transition-transform duration-300 ease-in-out",
        isScrollingDown ? "translate-y-[150%] opacity-0" : "translate-y-0 opacity-100",
        className
      )}
      style={{ bottom: 'calc(5.5rem + env(safe-area-inset-bottom))' }}
    >
      <div
        className={cn(
          "pointer-events-auto flex items-center bg-primary text-primary-foreground rounded-full shadow-xl transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 overflow-hidden cursor-pointer",
          isExpanded ? "w-auto h-14 pl-2 pr-6" : "w-14 h-14 justify-center"
        )}
        onClick={() => {
          if (!isExpanded) setIsExpanded(true);
        }}
      >
        <button
          type="button"
          aria-label={isExpanded ? "Close" : "Expand"}
          onClick={(e) => {
            if (isExpanded) {
              e.stopPropagation();
              setIsExpanded(false);
            }
          }}
          className={cn(
            "flex items-center justify-center shrink-0 rounded-full transition-colors hover:bg-black/10",
            isExpanded ? "w-10 h-10" : "w-14 h-14"
          )}
        >
          <Plus className={cn("h-6 w-6 transition-transform duration-300", isExpanded && "rotate-45")} />
        </button>

        <button
          type="button"
          onClick={(e) => {
            if (isExpanded) {
              e.stopPropagation();
              setIsExpanded(false);
              if (onClick) {
                onClick();
              } else if (href) {
                router.push(href);
              }
            }
          }}
          className={cn(
            "font-semibold whitespace-nowrap overflow-hidden transition-all duration-300 text-left outline-none",
            isExpanded ? "opacity-100 max-w-[200px] ml-2" : "opacity-0 max-w-0 ml-0"
          )}
        >
          {label}
        </button>
      </div>
    </div>,
    document.body
  );
}
