import type { Metadata, Viewport } from 'next';
import { Outfit } from 'next/font/google';
import './globals.css';

const outfit = Outfit({ 
  subsets: ['latin'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || 
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')
  ),
  title: 'Dena Pawna - Simple Money Ledger',
  description: 'Track money you lend and borrow with ease. A modern fintech application for personal finance.',
  icons: {
    icon: '/icon.svg',
    apple: '/logo-icon.jpg',
  },
};

export const viewport: Viewport = {
  themeColor: '#10b981', // matches emerald primary
};

import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from '@/components/theme-provider';
import { LanguageProvider } from '@/i18n/client';
import { getLocale } from '@/i18n/server';
import { SplashScreen } from '@/components/ui/splash-screen';

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var isPWA = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
                var hasSeen = sessionStorage.getItem('hasSeenSplash');
                if (!isPWA || hasSeen) {
                  document.documentElement.classList.add('hide-splash');
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className={`antialiased font-sans ${outfit.variable}`} suppressHydrationWarning>
        <LanguageProvider initialLocale={locale}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <SplashScreen />
            
            {/* Global Background Gradients (Liquid Mesh) */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
              {/* Base gradient layer for depth */}
              <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-secondary/20 dark:to-primary/10" />
              
              {/* Animated Mesh Orbs */}
              <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-primary rounded-full blur-[100px] opacity-40 dark:opacity-20 animate-pulse" style={{ animationDuration: '8s' }} />
              <div className="absolute top-[20%] right-[-10%] w-[40vw] h-[40vw] bg-blue-500 rounded-full blur-[100px] opacity-30 dark:opacity-15 animate-pulse" style={{ animationDuration: '12s', animationDelay: '2s' }} />
              <div className="absolute bottom-[-10%] left-[10%] w-[60vw] h-[60vw] bg-emerald-300 dark:bg-emerald-800 rounded-full blur-[120px] opacity-30 dark:opacity-20 animate-pulse" style={{ animationDuration: '10s', animationDelay: '4s' }} />
            </div>
            
            <div className="relative z-10 flex flex-col min-h-screen">
              {children}
            </div>
            
            <Toaster richColors />
          </ThemeProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
