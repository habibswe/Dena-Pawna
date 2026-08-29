'use client';

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"

export function ModeToggle() {
  const { theme, setTheme } = useTheme()

  // Avoid hydration mismatch by waiting for mount
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => setMounted(true), [])

  if (!mounted) {
    return (
      <Button variant="outline" size="icon" className="glass-panel border-primary/20 rounded-full h-10 w-10">
        <div className="h-4 w-4 bg-primary/20 rounded-full animate-pulse" />
      </Button>
    )
  }

  const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)

  return (
    <Button 
      variant="outline" 
      size="icon" 
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="glass-panel border-primary/20 hover:bg-primary/10 transition-colors rounded-full h-10 w-10 relative"
      aria-label="Toggle theme"
    >
      <Sun className={`h-[1.2rem] w-[1.2rem] text-primary transition-all absolute ${isDark ? 'rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'}`} />
      <Moon className={`h-[1.2rem] w-[1.2rem] text-primary transition-all absolute ${isDark ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-0 opacity-0'}`} />
    </Button>
  )
}
