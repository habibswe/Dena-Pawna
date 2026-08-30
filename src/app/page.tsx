import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';
import { ArrowRight, Wallet, Users, ShieldCheck, Activity } from 'lucide-react';
import { ModeToggle } from '@/components/ui/mode-toggle';
import { LanguageToggle } from '@/components/ui/language-toggle';
import { getDictionary } from '@/i18n/server';

export default async function LandingPage() {
  const t = await getDictionary();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-transparent text-foreground overflow-y-auto overflow-x-hidden relative">
      <div className="absolute top-6 right-6 z-50 flex items-center gap-2">
        {/* <LanguageToggle /> */}
        {/* <ModeToggle /> */}
      </div>

      {/* Main Content Area */}
      <main className="relative z-10 container mx-auto px-6 flex flex-col items-center text-center max-w-4xl pt-20 pb-16">
        
        {/* Brand Header */}
        <div className="mb-8 flex items-center justify-center gap-3">
          <div className="bg-primary/10 p-3 rounded-2xl glass-panel">
            <Activity className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-primary">{t.landing.title}</h1>
        </div>

        {/* Hero Section */}
        <h2 className="text-5xl sm:text-6xl font-black tracking-tighter mb-6 bg-clip-text text-transparent bg-gradient-to-br from-foreground to-foreground/70">
          {t.landing.headline}
        </h2>
        <p className="text-xl text-muted-foreground mb-10 max-w-2xl leading-relaxed">
          {t.landing.subhead}
        </p>

        {/* Call to Actions */}
        <div className="flex flex-col sm:flex-row gap-4 mb-20 w-full sm:w-auto">
          <Link 
            href="/signup" 
            className={buttonVariants({ size: "lg", className: "w-full sm:w-auto text-lg h-14 px-8 rounded-full shadow-lg hover:shadow-primary/25 transition-all" })}
          >
            {t.landing.getStarted} <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
          <Link 
            href="/login" 
            className={buttonVariants({ variant: "outline", size: "lg", className: "w-full sm:w-auto text-lg h-14 px-8 rounded-full glass-panel border-primary/20" })}
          >
            {t.landing.login}
          </Link>
        </div>

        {/* Feature Grid */}
        <div className="grid sm:grid-cols-3 gap-6 w-full text-left">
          <div className="glass-panel p-6 rounded-2xl flex flex-col items-start hover:-translate-y-1 transition-transform duration-300">
            <div className="bg-primary/10 p-3 rounded-lg mb-4 text-primary">
              <Wallet className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold mb-2">{t.landing.feature1_title}</h3>
            <p className="text-sm text-muted-foreground">{t.landing.feature1_desc}</p>
          </div>

          <div className="glass-panel p-6 rounded-2xl flex flex-col items-start hover:-translate-y-1 transition-transform duration-300">
            <div className="bg-primary/10 p-3 rounded-lg mb-4 text-primary">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold mb-2">{t.landing.feature2_title}</h3>
            <p className="text-sm text-muted-foreground">{t.landing.feature2_desc}</p>
          </div>

          <div className="glass-panel p-6 rounded-2xl flex flex-col items-start hover:-translate-y-1 transition-transform duration-300">
            <div className="bg-primary/10 p-3 rounded-lg mb-4 text-primary">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold mb-2">{t.landing.feature3_title}</h3>
            <p className="text-sm text-muted-foreground">{t.landing.feature3_desc}</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-6 text-center text-muted-foreground text-sm border-t border-border/40 w-full mt-auto glass-panel rounded-none">
        <p>&copy; {new Date().getFullYear()} {t.landing.footer}</p>
      </footer>
    </div>
  );
}
