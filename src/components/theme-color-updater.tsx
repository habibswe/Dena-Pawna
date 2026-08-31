'use client';

import { useTheme } from 'next-themes';
import { useEffect } from 'react';

export function ThemeColorUpdater() {
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    // Determine the color based on the resolved theme (light or dark)
    // #ffffff matches the light background, #09090b (or similar) matches the dark background
    const color = resolvedTheme === 'dark' ? '#09090b' : '#ffffff';
    
    // Remove ALL existing theme-color meta tags to prevent media query conflicts
    const existingTags = document.querySelectorAll('meta[name="theme-color"]');
    existingTags.forEach(tag => tag.remove());
    
    // Create exactly one unified theme-color tag
    const metaThemeColor = document.createElement('meta');
    metaThemeColor.setAttribute('name', 'theme-color');
    metaThemeColor.setAttribute('content', color);
    document.head.appendChild(metaThemeColor);
  }, [resolvedTheme]);

  return null;
}
