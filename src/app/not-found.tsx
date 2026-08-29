import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';
import { ArrowLeft, FileQuestion } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background/50 p-4">
      <div className="text-center max-w-md w-full glass-panel p-10 rounded-2xl flex flex-col items-center shadow-lg border-primary/20">
        <div className="bg-primary/10 p-6 rounded-full mb-8 relative">
          <div className="absolute inset-0 border-2 border-primary/20 rounded-full animate-ping opacity-20"></div>
          <FileQuestion className="w-16 h-16 text-primary relative z-10" />
        </div>
        <h1 className="text-7xl font-bold tracking-tighter text-primary mb-2">404</h1>
        <h2 className="text-2xl font-semibold mb-3">Page Not Found</h2>
        <p className="text-muted-foreground mb-10 leading-relaxed">
          We couldn't find the page you're looking for. It might have been moved, deleted, or perhaps it never existed in your ledger!
        </p>
        <Link href="/dashboard" className={buttonVariants({ size: "lg" }) + " w-full sm:w-auto font-medium flex items-center justify-center gap-2"}>
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </Link>
      </div>
    </div>
  );
}
