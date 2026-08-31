import { cn } from '@/lib/utils';

export function LiquidBackground({ className }: { className?: string }) {
  return (
    <div className={cn("fixed inset-0 overflow-hidden pointer-events-none z-0", className)}>
      {/* Base gradient layer for depth */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background/95 to-primary/5 dark:to-primary/5" />
      
      {/* Animated Mesh Orbs (Barely visible on mobile, vibrant on desktop) */}
      <div className="hidden md:block absolute top-[-10%] left-[-10%] w-[80vw] md:w-[50vw] h-[80vw] md:h-[50vw] bg-primary rounded-full blur-[100px] md:blur-[120px] opacity-0 md:opacity-50 dark:opacity-0 dark:md:opacity-30 animate-pulse" style={{ animationDuration: '8s' }} />
      <div className="hidden md:block absolute top-[20%] right-[-10%] w-[60vw] md:w-[40vw] h-[60vw] md:h-[40vw] bg-blue-500 rounded-full blur-[100px] md:blur-[120px] opacity-0 md:opacity-40 dark:opacity-0 dark:md:opacity-20 animate-pulse" style={{ animationDuration: '12s', animationDelay: '2s' }} />
      <div className="hidden md:block absolute bottom-[-10%] left-[10%] w-[90vw] md:w-[60vw] h-[90vw] md:h-[60vw] bg-emerald-400 dark:bg-emerald-600 rounded-full blur-[120px] md:blur-[150px] opacity-0 md:opacity-40 dark:opacity-0 dark:md:opacity-25 animate-pulse" style={{ animationDuration: '10s', animationDelay: '4s' }} />
    </div>
  );
}
