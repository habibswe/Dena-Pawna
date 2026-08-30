import Link from 'next/link';
import { Activity } from 'lucide-react';
import { ModeToggle } from '@/components/ui/mode-toggle';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen">
      {/* Header with Logo (Desktop Only) */}
      <header className="absolute top-0 left-0 w-full p-4 sm:p-6 z-50 hidden md:flex items-center justify-between">
        <Link href="/" className="inline-flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="bg-primary/10 p-2.5 rounded-xl glass-panel">
            <Activity className="w-6 h-6 text-primary" />
          </div>
          <span className="font-bold text-xl tracking-tight text-primary">Dena Pawna</span>
        </Link>
      </header>
      
      {/* Page Content */}
      {children}
    </div>
  );
}
