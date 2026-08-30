'use client';

import { useState, useRef, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

interface ExpandableFabProps {
  href?: string;
  onClick?: () => void;
  label: string;
  className?: string;
}

export function ExpandableFab({ href, onClick, label, className }: ExpandableFabProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

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



  return (
    <div 
      ref={containerRef}
      className={cn(
        "fixed bottom-20 right-4 z-[100] md:hidden flex items-center justify-end pointer-events-none",
        className
      )}
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
    </div>
  );
}
