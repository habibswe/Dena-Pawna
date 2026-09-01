'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { login, signup } from '@/app/(auth)/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CardDescription, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2, Activity } from 'lucide-react';
import { useTranslation } from '@/i18n/client';
import Link from 'next/link';

interface SlidingAuthCardProps {
  defaultMode: 'login' | 'signup';
}

export function SlidingAuthCard({ defaultMode }: SlidingAuthCardProps) {
  const [isLogin, setIsLogin] = useState(defaultMode === 'login');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { t } = useTranslation();

  // Sync mode with prop changes (if navigating directly)
  useEffect(() => {
    setIsLogin(defaultMode === 'login');
  }, [defaultMode]);

  const toggleMode = () => {
    const newMode = isLogin ? 'signup' : 'login';
    setIsLogin(!isLogin);
    // Update URL silently without reloading
    window.history.pushState(null, '', `/${newMode}`);
  };

  const handleLoginSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    const result = await login(formData);
    
    if (result?.error) {
      toast.error(result.error);
      setIsLoading(false);
    } else if (result?.success) {
      toast.success('Logged in successfully!');
      router.push('/dashboard');
      router.refresh();
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    const result = await signup(formData);
    
    if (result?.error) {
      toast.error(result.error);
      setIsLoading(false);
    } else if (result?.message) {
      toast.success(result.message, { duration: 10000 });
      setIsLoading(false);
      // Optionally switch to login mode here
      toggleMode();
    }
  };

  const handleGoogleLogin = async () => {
    const { createClient } = await import('@/lib/supabase/client');
    const supabase = createClient();
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${origin}/auth/callback`,
      },
    });
  };

  // Google Button SVG
  const GoogleIcon = () => (
    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );

  return (
    <div className="flex flex-col md:flex-row w-full min-h-[100dvh] bg-transparent relative z-10 items-center justify-center p-4 overflow-hidden">
      
      {/* Mobile Top Header Removed - Using AuthLayout instead */}

      {/* Main Container - The Glass Card */}
      <div className="relative w-full max-w-4xl h-[600px] glass-panel border-primary/20 bg-background/60 backdrop-blur-xl shadow-[0_0_50px_rgba(0,0,0,0.1)] rounded-[2rem] overflow-hidden hidden md:block">
        
        {/* --- SIGN IN FORM (Left Side) --- */}
        <div className={`absolute top-0 left-0 w-1/2 h-full flex flex-col justify-center px-12 transition-all duration-700 ease-in-out ${isLogin ? 'opacity-100 z-20 translate-x-0' : 'opacity-0 z-0 pointer-events-none translate-x-[20%]'}`}>
          <div className="text-center mb-6">
            <CardTitle className="text-3xl font-bold">{t.auth.loginTitle}</CardTitle>
            <CardDescription className="mt-2">{t.auth.loginSubtitle}</CardDescription>
          </div>
          
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="login-email">{t.auth.emailLabel}</Label>
              <Input id="login-email" name="email" type="email" placeholder="m@example.com" required className="bg-background/50 border-primary/10" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="login-password">{t.auth.passwordLabel}</Label>
              <Input id="login-password" name="password" type="password" required className="bg-background/50 border-primary/10" />
              <div className="flex justify-end pt-1">
                <Link href="/forgot-password" className="text-sm font-medium text-primary hover:underline">
                  {t.auth.forgotPasswordLink}
                </Link>
              </div>
            </div>
            
            <Button className="w-full mt-4 h-11" type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t.auth.signInBtn}
            </Button>
            
            <div className="relative w-full my-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border/50" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground rounded-full">Or continue with</span>
              </div>
            </div>

            <Button type="button" variant="outline" className="w-full h-11 bg-background/50 border-primary/10 hover:bg-primary/5" disabled={isLoading} onClick={handleGoogleLogin}>
              <GoogleIcon /> Google
            </Button>
          </form>
        </div>

        {/* --- SIGN UP FORM (Right Side) --- */}
        <div className={`absolute top-0 right-0 w-1/2 h-full flex flex-col justify-center px-12 transition-all duration-700 ease-in-out ${!isLogin ? 'opacity-100 z-20 translate-x-0' : 'opacity-0 z-0 pointer-events-none -translate-x-[20%]'}`}>
          <div className="text-center mb-6">
            <CardTitle className="text-3xl font-bold">{t.auth.signupTitle}</CardTitle>
            <CardDescription className="mt-2">{t.auth.signupSubtitle}</CardDescription>
          </div>
          
          <form onSubmit={handleSignupSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="signup-name">Full Name</Label>
              <Input id="signup-name" name="name" type="text" placeholder="e.g. John Doe" required className="bg-background/50 border-primary/10" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="signup-email">{t.auth.emailLabel}</Label>
              <Input id="signup-email" name="email" type="email" placeholder="m@example.com" required className="bg-background/50 border-primary/10" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="signup-password">{t.auth.passwordLabel}</Label>
              <Input id="signup-password" name="password" type="password" required className="bg-background/50 border-primary/10" />
            </div>
            
            <Button className="w-full mt-2 h-11" type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t.auth.signUpBtn}
            </Button>
            
            <div className="relative w-full my-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border/50" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground rounded-full">Or continue with</span>
              </div>
            </div>

            <Button type="button" variant="outline" className="w-full h-11 bg-background/50 border-primary/10 hover:bg-primary/5" disabled={isLoading} onClick={handleGoogleLogin}>
              <GoogleIcon /> Google
            </Button>
          </form>
        </div>

        {/* --- THE SLIDING OVERLAY PANEL --- */}
        <div 
          className={`absolute top-0 left-0 w-1/2 h-full z-30 transition-transform duration-700 ease-in-out shadow-2xl ${isLogin ? 'translate-x-full' : 'translate-x-0'}`}
        >
          {/* Overlay Background - Premium Liquid Gradient */}
          <div className="absolute inset-0 overflow-hidden bg-primary/90">
             <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-gradient-to-br from-primary via-emerald-500 to-blue-600 opacity-90" />
             {/* Decorative Blurs inside overlay */}
             <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-white rounded-full blur-[80px] opacity-20" />
             <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-emerald-900 rounded-full blur-[80px] opacity-30" />
          </div>

          {/* Overlay Content */}
          <div className="relative z-10 flex flex-col items-center justify-center h-full text-white p-12 text-center">
            <div className="bg-white/20 p-4 rounded-2xl inline-block mb-6 backdrop-blur-md shadow-lg border border-white/10">
              <Activity className="w-10 h-10 text-white" />
            </div>
            
            {/* Dynamic Content based on mode */}
            <div className="relative h-[150px] w-full flex flex-col items-center justify-center">
              {/* Login mode text (shown when overlay is on right) */}
              <div className={`absolute transition-all duration-700 transform flex flex-col items-center w-full ${isLogin ? 'opacity-100 translate-x-0 delay-100' : 'opacity-0 -translate-x-20 pointer-events-none'}`}>
                <h2 className="text-3xl font-extrabold mb-4 text-white">Hello, Friend!</h2>
                <p className="text-white/80 mb-8 max-w-[80%] leading-relaxed">Enter your personal details and start your journey with us.</p>
                <Button 
                  variant="outline" 
                  className="rounded-full px-12 bg-transparent text-white border-white/40 hover:bg-white hover:text-primary transition-all duration-300 h-12 text-md tracking-wider font-semibold"
                  onClick={toggleMode}
                >
                  SIGN UP
                </Button>
              </div>

              {/* Signup mode text (shown when overlay is on left) */}
              <div className={`absolute transition-all duration-700 transform flex flex-col items-center w-full ${!isLogin ? 'opacity-100 translate-x-0 delay-100' : 'opacity-0 translate-x-20 pointer-events-none'}`}>
                <h2 className="text-3xl font-extrabold mb-4 text-white">Welcome Back!</h2>
                <p className="text-white/80 mb-8 max-w-[80%] leading-relaxed">To keep connected with us please login with your personal info.</p>
                <Button 
                  variant="outline" 
                  className="rounded-full px-12 bg-transparent text-white border-white/40 hover:bg-white hover:text-primary transition-all duration-300 h-12 text-md tracking-wider font-semibold"
                  onClick={toggleMode}
                >
                  SIGN IN
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- MOBILE FALLBACK (Vertical Forms) --- */}
      <div className="md:hidden w-full max-w-md mt-16 pb-8 px-4">
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border-primary/20 bg-background/60 backdrop-blur-xl shadow-xl relative z-10 w-full">
          <div className="text-center mb-6">
            <CardTitle className="text-2xl font-bold">{isLogin ? t.auth.loginTitle : t.auth.signupTitle}</CardTitle>
            <CardDescription className="mt-2">{isLogin ? t.auth.loginSubtitle : t.auth.signupSubtitle}</CardDescription>
          </div>

          {isLogin ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="mobile-login-email">{t.auth.emailLabel}</Label>
                <Input id="mobile-login-email" name="email" type="email" placeholder="m@example.com" required className="bg-background/50 border-primary/10" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mobile-login-password">{t.auth.passwordLabel}</Label>
                <Input id="mobile-login-password" name="password" type="password" required className="bg-background/50 border-primary/10" />
                <div className="flex justify-end pt-1">
                  <Link href="/forgot-password" className="text-sm font-medium text-primary hover:underline">
                    {t.auth.forgotPasswordLink}
                  </Link>
                </div>
              </div>
              <Button className="w-full mt-4 h-11" type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t.auth.signInBtn}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleSignupSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="mobile-signup-name">Full Name</Label>
                <Input id="mobile-signup-name" name="name" type="text" placeholder="e.g. John Doe" required className="bg-background/50 border-primary/10" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mobile-signup-email">{t.auth.emailLabel}</Label>
                <Input id="mobile-signup-email" name="email" type="email" placeholder="m@example.com" required className="bg-background/50 border-primary/10" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mobile-signup-password">{t.auth.passwordLabel}</Label>
                <Input id="mobile-signup-password" name="password" type="password" required className="bg-background/50 border-primary/10" />
              </div>
              <Button className="w-full mt-2 h-11" type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t.auth.signUpBtn}
              </Button>
            </form>
          )}

          <div className="relative w-full my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border/50" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground rounded-full">Or continue with</span>
            </div>
          </div>

          <Button type="button" variant="outline" className="w-full h-11 bg-background/50 border-primary/10 hover:bg-primary/5 mb-6" disabled={isLoading} onClick={handleGoogleLogin}>
            <GoogleIcon /> Google
          </Button>

          <div className="text-center text-sm border-t border-border/50 pt-6">
            {isLogin ? (
              <>
                {t.auth.noAccount}{' '}
                <button type="button" onClick={toggleMode} className="font-medium text-primary hover:underline transition-colors">
                  {t.auth.signUpBtn}
                </button>
              </>
            ) : (
              <>
                {t.auth.hasAccount}{' '}
                <button type="button" onClick={toggleMode} className="font-medium text-primary hover:underline transition-colors">
                  {t.auth.signInBtn}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
      
    </div>
  );
}
