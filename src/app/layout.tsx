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
import { LiquidBackground } from '@/components/ui/liquid-background';

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
            defaultTheme="light"
            enableSystem={false}
            disableTransitionOnChange
          >
            <SplashScreen />
            
            {/* Global Background Gradients (Liquid Mesh) - Hidden entirely on Desktop for dashboard */}
            <LiquidBackground className="md:hidden" />
            
            <div className="relative z-10 flex flex-col h-[100dvh] overflow-y-auto overflow-x-hidden">
              {children}
            </div>
            
            <Toaster richColors />
          </ThemeProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
