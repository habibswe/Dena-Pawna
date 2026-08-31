import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';
import { ArrowRight, Wallet, Users, ShieldCheck, Activity } from 'lucide-react';
import { ModeToggle } from '@/components/ui/mode-toggle';
import { getDictionary } from '@/i18n/server';

export default async function LandingPage() {
  const t = await getDictionary();

  return (
    <div className="min-h-[100dvh] w-full flex flex-col items-center bg-transparent text-foreground relative overflow-x-hidden">
      
      {/* Floating Glass Navbar */}
      <header className="w-full max-w-5xl mx-auto p-4 relative z-50 mt-4 md:mt-8">
        <div className="glass-panel rounded-full px-6 py-3 flex items-center justify-between border-primary/20 bg-background/40 backdrop-blur-3xl shadow-xl">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="bg-primary/20 p-2 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.3)]">
              <Activity className="w-6 h-6 text-primary" />
            </div>
            <span className="font-extrabold text-xl tracking-tight text-primary">{t.landing.title}</span>
          </Link>
          <div className="flex items-center gap-2 md:gap-4">
            <Link href="/login" className="text-sm font-medium hover:text-primary transition-colors hidden md:block">
              {t.landing.login}
            </Link>
            <Link href="/signup" className={buttonVariants({ size: "sm", className: "rounded-full shadow-lg hover:shadow-primary/25 transition-all" })}>
              {t.landing.getStarted}
            </Link>
          </div>
        </div>
      </header>

      <div className="flex-1 w-full min-h-[1rem] md:min-h-[2rem]" />

      {/* Main Content Area */}
      <main className="relative z-10 container mx-auto px-6 flex flex-col items-center text-center max-w-5xl shrink-0 py-8 md:py-12">

        {/* Hero Section */}
        <div className="glass-panel p-8 md:p-16 rounded-[3rem] border-primary/20 bg-background/20 backdrop-blur-3xl shadow-2xl relative overflow-hidden mb-16 w-full">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-[300px] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />
          
          <h2 className="text-5xl md:text-7xl font-black tracking-tighter mb-6 bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/60 relative z-10">
            {t.landing.headline}
          </h2>
          <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-3xl mx-auto leading-relaxed relative z-10">
            {t.landing.subhead}
          </p>

          {/* Call to Actions */}
          <div className="flex flex-col sm:flex-row justify-center gap-4 w-full sm:w-auto relative z-10">
            <Link 
              href="/signup" 
              className={buttonVariants({ size: "lg", className: "w-full sm:w-auto text-lg h-14 px-8 rounded-full shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:shadow-[0_0_40px_rgba(16,185,129,0.5)] hover:scale-105 transition-all duration-300" })}
            >
              {t.landing.getStarted} <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
            <Link 
              href="/login" 
              className={buttonVariants({ variant: "outline", size: "lg", className: "w-full sm:w-auto text-lg h-14 px-8 rounded-full glass-panel border-primary/20 hover:bg-primary/10 transition-all duration-300" })}
            >
              {t.landing.login}
            </Link>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="grid sm:grid-cols-3 gap-6 w-full text-left">
          <div className="glass-panel p-8 rounded-3xl border-primary/10 bg-background/40 backdrop-blur-2xl shadow-xl flex flex-col items-start hover:-translate-y-2 hover:shadow-primary/20 hover:border-primary/30 transition-all duration-300 group">
            <div className="bg-primary/10 p-4 rounded-2xl mb-6 text-primary group-hover:bg-primary group-hover:text-primary-foreground group-hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all duration-300">
              <Wallet className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-3">{t.landing.feature1_title}</h3>
            <p className="text-base text-muted-foreground leading-relaxed">{t.landing.feature1_desc}</p>
          </div>

          <div className="glass-panel p-8 rounded-3xl border-primary/10 bg-background/40 backdrop-blur-2xl shadow-xl flex flex-col items-start hover:-translate-y-2 hover:shadow-primary/20 hover:border-primary/30 transition-all duration-300 group">
            <div className="bg-primary/10 p-4 rounded-2xl mb-6 text-primary group-hover:bg-primary group-hover:text-primary-foreground group-hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all duration-300">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-3">{t.landing.feature2_title}</h3>
            <p className="text-base text-muted-foreground leading-relaxed">{t.landing.feature2_desc}</p>
          </div>

          <div className="glass-panel p-8 rounded-3xl border-primary/10 bg-background/40 backdrop-blur-2xl shadow-xl flex flex-col items-start hover:-translate-y-2 hover:shadow-primary/20 hover:border-primary/30 transition-all duration-300 group">
            <div className="bg-primary/10 p-4 rounded-2xl mb-6 text-primary group-hover:bg-primary group-hover:text-primary-foreground group-hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all duration-300">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-3">{t.landing.feature3_title}</h3>
            <p className="text-base text-muted-foreground leading-relaxed">{t.landing.feature3_desc}</p>
          </div>
        </div>
      </main>

      <div className="flex-1 w-full min-h-[2rem]" />

      {/* Footer */}
      <footer className="relative z-10 py-6 text-center text-muted-foreground text-sm border-t border-border/40 w-full shrink-0 glass-panel rounded-none">
        <p>&copy; {new Date().getFullYear()} {t.landing.footer}</p>
      </footer>
    </div>
  );
}
