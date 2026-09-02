import { PublicHeader } from '@/components/layout/public-header';

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[100dvh] w-full flex flex-col items-center bg-transparent text-foreground relative overflow-x-hidden">
      {/* Shared Floating Glass Navbar */}
      <PublicHeader />

      <div className="w-full min-h-[1rem] md:min-h-[2rem]" />

      {/* Page Content */}
      <main className="relative z-10 container mx-auto px-4 md:px-6 flex flex-col items-center max-w-5xl shrink-0 py-8 md:py-12 w-full pb-16">
        {children}
      </main>
    </div>
  );
}


