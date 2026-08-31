'use client';

import { useState } from 'react';
import { CardDescription, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Activity } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function ResetPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

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
      {/* Mobile Top Header */}
      <header className="md:hidden absolute top-0 left-0 right-0 h-14 border-b flex items-center justify-between px-4 glass-panel z-20 bg-card">
        <div className="flex items-center gap-2">
          <div className="bg-primary/10 p-1.5 rounded-xl glass-panel">
            <Activity className="w-5 h-5 text-primary" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-primary">Dena Pawna</h1>
        </div>
      </header>

      {/* Main Container - The Glass Card */}
      <div className="relative w-full max-w-md mt-12 md:mt-0 glass-panel border-primary/20 bg-background/60 backdrop-blur-xl shadow-[0_0_50px_rgba(0,0,0,0.1)] rounded-[2rem] p-8 md:p-12 z-10 animate-fade-in-up">
        <div className="text-center mb-6">
          <div className="bg-primary/10 p-3 rounded-2xl inline-block mb-4 shadow-[0_0_20px_rgba(16,185,129,0.1)]">
            <Activity className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">Set New Password</CardTitle>
          <CardDescription className="mt-2">
            Enter your new password below.
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
            <div className="text-sm text-destructive font-medium bg-destructive/10 p-3 rounded-md mt-2">
              {error}
            </div>
          )}
          
          <Button type="submit" className="w-full mt-6 h-11" disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Update Password
          </Button>
        </form>
      </div>
    </div>
  );
}
