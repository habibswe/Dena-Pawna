'use client';

import { useState } from 'react';
import { CardDescription, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { sendPasswordResetEmail } from '../actions';
import { Loader2, ArrowLeft, CheckCircle2, Activity } from 'lucide-react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    const formData = new FormData(e.currentTarget);
    const result = await sendPasswordResetEmail(formData);

    if (result?.error) {
      setError(result.error);
    } else if (result?.success) {
      setSuccess(true);
    }
    
    setIsLoading(false);
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
          <CardTitle className="text-2xl font-bold">Forgot Password</CardTitle>
          <CardDescription className="mt-2">
            Enter your email and we will send you a reset link.
          </CardDescription>
        </div>
        
        {success ? (
          <div className="bg-primary/10 text-primary p-4 rounded-xl flex items-start gap-3 mb-4 border border-primary/20">
            <CheckCircle2 className="h-5 w-5 mt-0.5" />
            <div>
              <h4 className="font-medium">Check your email</h4>
              <p className="text-sm mt-1">We've sent a password reset link to your email address.</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="m@example.com"
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
              Send Reset Link
            </Button>
          </form>
        )}
        
        <div className="text-sm text-muted-foreground w-full text-center mt-8 pt-6 border-t border-border/50">
          <Link href="/login" className="font-medium text-primary hover:underline inline-flex items-center gap-1 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}
