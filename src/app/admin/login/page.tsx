'use client';

import { useActionState } from 'react';
import { loginAdmin } from '../actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Lock } from 'lucide-react';
import { useFormStatus } from 'react-dom';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button className="w-full" type="submit" disabled={pending}>
      {pending ? 'Verifying...' : 'Access Panel'}
    </Button>
  );
}

export default function AdminLoginPage() {
  const [state, formAction] = useActionState(loginAdmin, null);

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-md mx-4 glass-panel border-primary/20">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-2">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Lock className="h-6 w-6 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Super Admin</CardTitle>
          <CardDescription>
            Enter the master password to access the platform controls.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Master Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                placeholder="••••••••"
              />
              {state?.error && (
                <p className="text-sm font-medium text-destructive">{state.error}</p>
              )}
            </div>
            <SubmitButton />
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <a href="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">
            Return to User App
          </a>
        </CardFooter>
      </Card>
    </div>
  );
}
