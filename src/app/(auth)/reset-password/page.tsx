'use client';

import { useState } from 'react';
import { CardDescription, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Activity } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/i18n/client';

export default function ResetPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { t } = useTranslation();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      setIsLoading(false);
      return;
    }

    try {
      const supabase = createClient();
      
      // When the user clicks the link in the email, Supabase sets the session via the URL hash.
      // So calling updateUser here will update the password for the newly authenticated session.
      const { error } = await supabase.auth.updateUser({ password });
      
      if (error) {
        setError(error.message);
      } else {
        router.push('/');
      }
    } catch (err) {
      setError('An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col w-full min-h-[100dvh] bg-transparent relative z-10 items-center justify-center p-4">
      {/* Mobile Top Header Removed - Using AuthLayout instead */}

      {/* Main Container - The Glass Card */}
      <div className="relative w-full max-w-md mt-12 md:mt-0 glass-panel border-primary/20 bg-background/60 backdrop-blur-xl shadow-[0_0_50px_rgba(0,0,0,0.1)] rounded-[2rem] p-8 md:p-12 z-10 animate-fade-in-up">
        <div className="text-center mb-6">
          <div className="bg-primary/10 p-3 rounded-2xl inline-block mb-4 shadow-[0_0_20px_rgba(16,185,129,0.1)]">
            <Activity className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">{t.auth.resetPasswordTitle}</CardTitle>
          <CardDescription className="mt-2">
            {t.auth.resetPasswordSubtitle}
          </CardDescription>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">New Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              className="bg-background/50 border-primary/10"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              className="bg-background/50 border-primary/10"
            />
          </div>
          
          {error && (
            <div className="text-sm text-destructive font-medium bg-destructive/10 p-3 rounded-md">
              {error}
            </div>
          )}
          
          <Button type="submit" className="w-full mt-4 h-11" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t.auth.updatePasswordBtn}
          </Button>
        </form>
      </div>
    </div>
  );
}
