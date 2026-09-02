'use client';

import { useEffect } from 'react';

export function AdminThemeEnforcer() {
  useEffect(() => {
    const htmlEl = document.documentElement;
    htmlEl.classList.remove('dark');
    htmlEl.classList.add('light');
  }, []);

  return null;
}
