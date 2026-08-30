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
import { useTranslation } from '@/i18n/client';
import { Languages } from 'lucide-react';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { locale, setLocale, t } = useTranslation();
  const [isLoadingPage, setIsLoadingPage] = useState(true);
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [userId, setUserId] = useState('');
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const [mobileView, setMobileView] = useState<'menu' | 'profile' | 'password' | 'preferences'>('menu');
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

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

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await logout();
  };

  if (isLoadingPage) {
    return <DashboardLoading />;
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className={`${mobileView !== 'menu' ? 'hidden md:block' : 'block'}`}>
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground mt-1">Manage your account settings and preferences.</p>
      </div>

      {/* Mobile Menu (Hidden on Desktop, Hidden if viewing a specific section on mobile) */}
      <div className={`md:hidden ${mobileView === 'menu' ? 'flex' : 'hidden'} flex-col gap-3 mt-4`}>
        <Button 
          variant="outline" 
          className="h-16 justify-start text-lg px-4 glass-panel border-primary/20 shadow-sm"
          onClick={() => setMobileView('profile')}
        >
          <div className="bg-primary/10 p-2 rounded-lg mr-4">
            <User className="h-5 w-5 text-primary" />
          </div>
          Profile details
        </Button>
        <Button 
          variant="outline" 
          className="h-16 justify-start text-lg px-4 glass-panel border-primary/20 shadow-sm"
          onClick={() => setMobileView('password')}
        >
          <div className="bg-primary/10 p-2 rounded-lg mr-4">
            <Settings2 className="h-5 w-5 text-primary" />
          </div>
          Change Password
        </Button>
        <Button 
          variant="outline" 
          className="h-16 justify-start text-lg px-4 glass-panel border-primary/20 shadow-sm"
          onClick={() => setMobileView('preferences')}
        >
          <div className="bg-primary/10 p-2 rounded-lg mr-4">
            <Settings2 className="h-5 w-5 text-primary" />
          </div>
          Preferences
        </Button>
        <Button 
          variant="outline" 
          className="h-16 justify-start text-lg px-4 glass-panel border-destructive/20 text-destructive shadow-sm"
          onClick={() => setIsLogoutOpen(true)}
        >
          <div className="bg-destructive/10 p-2 rounded-lg mr-4">
            <LogOut className="h-5 w-5 text-destructive" />
          </div>
          Sign Out
        </Button>
      </div>

      {/* Profile Section */}
      <Card className={`glass-panel ${mobileView === 'profile' ? 'block' : 'hidden md:block'}`}>
        <CardHeader className="flex flex-row items-center gap-4 space-y-0">
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileView('menu')}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </Button>
          <div>
            <CardTitle className="flex items-center gap-2"><User className="h-5 w-5 text-primary" /> Profile</CardTitle>
            <CardDescription>Your personal information</CardDescription>
          </div>
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
        </CardContent>
      </Card>

      {/* Password Section (Split from Profile on Mobile, combined on Desktop) */}
      <Card className={`glass-panel ${mobileView === 'password' ? 'block' : 'hidden md:block'}`}>
        <CardHeader className="flex flex-row items-center gap-4 space-y-0">
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileView('menu')}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </Button>
          <div>
            <CardTitle className="flex items-center gap-2"><Settings2 className="h-5 w-5 text-primary" /> Change Password</CardTitle>
            <CardDescription>Update your security credentials</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
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
        </CardContent>
      </Card>

      {/* Preferences Section */}
      <Card className={`glass-panel ${mobileView === 'preferences' ? 'block' : 'hidden md:block'}`}>
        <CardHeader className="flex flex-row items-center gap-4 space-y-0">
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileView('menu')}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </Button>
          <div>
            <CardTitle className="flex items-center gap-2"><Settings2 className="h-5 w-5 text-primary" /> Preferences</CardTitle>
            <CardDescription>Customize your experience</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="space-y-3">
            <Label>Appearance</Label>
            
            <div 
              className="relative flex items-center bg-secondary/50 rounded-full p-1 w-full max-w-xs cursor-pointer border border-border"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              {/* Sliding Pill Background */}
              <div 
                className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-primary rounded-full shadow-md transition-transform duration-300 ease-in-out ${
                  theme === 'dark' ? 'translate-x-[calc(100%+4px)]' : 'translate-x-0'
                }`} 
              />
              
              <div className={`flex-1 text-center z-10 flex items-center justify-center py-2.5 text-sm font-medium transition-colors ${theme !== 'dark' ? 'text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
                <Sun className="h-4 w-4 mr-2" /> Light
              </div>
              <div className={`flex-1 text-center z-10 flex items-center justify-center py-2.5 text-sm font-medium transition-colors ${theme === 'dark' ? 'text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
                <Moon className="h-4 w-4 mr-2" /> Dark
              </div>
            </div>
            
            <p className="text-xs text-muted-foreground">Tap or swipe to switch between light and dark mode.</p>
          </div>

          <div className="space-y-3 pt-4 border-t border-border">
            <Label>Language / ভাষা</Label>
            
            <div 
              className="relative flex items-center bg-secondary/50 rounded-full p-1 w-full max-w-xs cursor-pointer border border-border"
              onClick={() => setLocale(locale === 'en' ? 'bn' : 'en')}
            >
              {/* Sliding Pill Background */}
              <div 
                className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-primary rounded-full shadow-md transition-transform duration-300 ease-in-out ${
                  locale === 'bn' ? 'translate-x-[calc(100%+4px)]' : 'translate-x-0'
                }`} 
              />
              
              <div className={`flex-1 text-center z-10 flex items-center justify-center py-2.5 text-sm font-medium transition-colors ${locale === 'en' ? 'text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
                English
              </div>
              <div className={`flex-1 text-center z-10 flex items-center justify-center py-2.5 text-sm font-medium transition-colors ${locale === 'bn' ? 'text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
                বাংলা
              </div>
            </div>
            
            <p className="text-xs text-muted-foreground">Select your preferred language.</p>
          </div>

          <div className="space-y-2 pt-4 border-t border-border">
            <Label>Currency</Label>
            <Input disabled value="Bangladeshi Taka (BDT / ৳)" />
            <p className="text-xs text-muted-foreground">Multi-currency support coming soon.</p>
          </div>
        </CardContent>
      </Card>

      {/* Logout Section (Desktop Only) */}
      <Card className="glass-panel border-destructive/20 hidden md:block">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
          <CardDescription>Account security and management</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="destructive" onClick={() => setIsLogoutOpen(true)}>
            <LogOut className="mr-2 h-4 w-4" /> Sign Out
          </Button>
        </CardContent>
      </Card>

      <ConfirmDialog
        isOpen={isLogoutOpen}
        onClose={() => !isLoggingOut && setIsLogoutOpen(false)}
        onConfirm={handleLogout}
        title="Sign Out?"
        description="Are you sure you want to sign out of your account?"
        isDeleting={isLoggingOut}
        confirmText="Sign Out"
      />
    </div>
  );
}
