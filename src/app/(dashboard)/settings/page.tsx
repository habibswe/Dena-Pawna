'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { logout } from '@/app/(auth)/actions';
import { LogOut, User, Settings2, Download, FileText, FileSpreadsheet, Loader2, Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { useTheme } from 'next-themes';
import DashboardLoading from '@/components/ui/dashboard-loading';

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [isLoadingPage, setIsLoadingPage] = useState(true);
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [userId, setUserId] = useState('');
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setEmail(user.email || '');
        setUserId(user.id);
        const { data } = await supabase.from('profiles').select('full_name').eq('id', user.id).single();
        if (data?.full_name) {
          setFullName(data.full_name);
        }
      }
      setIsLoadingPage(false);
    };
    
    fetchUser();
  }, []);

  const handleSaveProfile = async () => {
    if (!userId) return;
    setIsSaving(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.from('profiles').upsert({ id: userId, full_name: fullName });
      if (error) {
        console.error('Error saving profile:', error);
        toast.error('Failed to save profile. Please try again.');
      } else {
        toast.success('Profile saved successfully!');
      }
    } catch (err) {
      console.error(err);
      toast.error('An unexpected error occurred.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    setIsChangingPassword(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      
      if (error) {
        console.error('Error changing password:', error);
        toast.error(error.message || 'Failed to change password.');
      } else {
        toast.success('Password changed successfully!');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      console.error(err);
      toast.error('An unexpected error occurred.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (isLoadingPage) {
    return <DashboardLoading />;
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">Manage your account settings and preferences.</p>
      </div>

      <Card className="glass-panel">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><User className="h-5 w-5 text-primary" /> Profile</CardTitle>
          <CardDescription>Your personal information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Email</Label>
            <Input disabled value={email} />
            <p className="text-xs text-muted-foreground">Your email is used for login and cannot be changed.</p>
          </div>
          <div className="space-y-2">
            <Label>Full Name</Label>
            <Input 
              placeholder="Enter your full name" 
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>
          <Button onClick={handleSaveProfile} disabled={isSaving}>
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Save Changes
          </Button>

          <div className="pt-6 border-t border-border mt-6">
            <h3 className="text-md font-medium mb-4">Change Password</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>New Password</Label>
                <Input 
                  type="password" 
                  placeholder="New password (min 6 chars)" 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Confirm Password</Label>
                <Input 
                  type="password" 
                  placeholder="Confirm new password" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
              <Button variant="outline" onClick={handleChangePassword} disabled={isChangingPassword || !newPassword}>
                {isChangingPassword ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Update Password
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="glass-panel">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Settings2 className="h-5 w-5 text-primary" /> Preferences</CardTitle>
          <CardDescription>Customize your experience</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Appearance</Label>
            <div className="flex flex-wrap gap-2">
              <Button 
                variant={theme === 'light' ? 'default' : 'outline'} 
                onClick={() => setTheme('light')}
              >
                <Sun className="mr-2 h-4 w-4" /> Light Mode
              </Button>
              <Button 
                variant={theme === 'dark' ? 'default' : 'outline'} 
                onClick={() => setTheme('dark')}
              >
                <Moon className="mr-2 h-4 w-4" /> Dark Mode
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">Select your preferred theme.</p>
          </div>

          <div className="space-y-2 pt-4 border-t border-border">
            <Label>Currency</Label>
            <Input disabled value="Bangladeshi Taka (BDT / ৳)" />
            <p className="text-xs text-muted-foreground">Multi-currency support coming soon.</p>
          </div>
        </CardContent>
      </Card>

      <Card className="glass-panel border-destructive/20">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
          <CardDescription>Account security and management</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={logout}>
            <Button variant="destructive" type="submit">
              <LogOut className="mr-2 h-4 w-4" /> Sign Out
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
