import type { Metadata, Viewport } from 'next';
import { Outfit } from 'next/font/google';
import './globals.css';

const outfit = Outfit({ 
  subsets: ['latin'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: 'Dena Pawna - Simple Money Ledger',
  description: 'Track money you lend and borrow with ease. A modern fintech application for personal finance.',
  icons: {
    apple: '/logo-icon.jpg',
  },
};

export const viewport: Viewport = {
  themeColor: '#10b981', // matches emerald primary
};

import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from '@/components/theme-provider';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`antialiased font-sans ${outfit.variable}`} suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {/* Global Background Gradients */}
          <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
            <div className="absolute top-0 -left-4 w-72 h-72 bg-primary rounded-full blur-[100px] opacity-30 dark:opacity-20 animate-pulse" />
            <div className="absolute top-0 -right-4 w-72 h-72 bg-secondary rounded-full blur-[100px] opacity-30 dark:opacity-20 animate-pulse" style={{ animationDelay: '2s' }} />
            <div className="absolute -bottom-8 left-20 w-72 h-72 bg-destructive rounded-full blur-[100px] opacity-20 dark:opacity-10 animate-pulse" style={{ animationDelay: '4s' }} />
          </div>
          
          <div className="relative z-10 flex flex-col min-h-screen">
            {children}
          </div>
          
          <Toaster richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}
