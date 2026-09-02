'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export function ScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    // 1. Reset standard window scroll
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });

    // 2. Reset custom app-layout scroll container
    const mainContainer = document.getElementById('main-scroll-container');
    if (mainContainer) {
      mainContainer.scrollTop = 0;
    }

    // 3. Reset any parent overflow-y-auto containers
    const scrollableElements = document.querySelectorAll('.overflow-y-auto');
    scrollableElements.forEach((el) => {
      el.scrollTop = 0;
    });
  }, [pathname]);

  return null;
}
