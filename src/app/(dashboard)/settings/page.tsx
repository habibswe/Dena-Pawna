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

import { useTranslation } from '@/i18n/client';
import { Languages } from 'lucide-react';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

export default function SettingsPage() {
  const { theme, setTheme, resolvedTheme } = useTheme();
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
    return (
      <div className="space-y-6 animate-in fade-in duration-300 w-full">
        <div className="space-y-2 mb-6">
          <div className="h-8 w-48 bg-primary/10 rounded-lg animate-pulse glass-panel" />
          <div className="h-4 w-64 md:w-96 bg-muted/50 rounded-md animate-pulse" />
        </div>
        
        <div className="md:hidden flex flex-col gap-3 mt-4">
          {Array(4).fill(0).map((_, i) => (
            <div key={i} className="h-14 w-full bg-muted/30 rounded-md animate-pulse" />
          ))}
        </div>
        
        <div className="hidden md:block space-y-6">
          {Array(4).fill(0).map((_, i) => (
            <div key={i} className="glass-panel p-6 space-y-6 rounded-xl border border-border shadow-sm">
              <div className="space-y-2">
                <div className="h-6 w-32 bg-muted rounded animate-pulse" />
                <div className="h-4 w-64 bg-muted/50 rounded animate-pulse" />
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                  <div className="h-10 w-full bg-muted/30 rounded-md animate-pulse" />
                </div>
                {i < 2 && (
                  <div className="space-y-2">
                    <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                    <div className="h-10 w-full bg-muted/30 rounded-md animate-pulse" />
                  </div>
                )}
                <div className="h-10 w-32 bg-primary/30 rounded-md animate-pulse mt-4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className={`${mobileView !== 'menu' ? 'hidden md:block' : 'block'}`}>
        <h2 className="text-3xl font-bold tracking-tight">{t.settings.title}</h2>
        <p className="text-muted-foreground mt-1">{t.settings.subtitle}</p>
      </div>

      {/* Mobile Menu (Hidden on Desktop, Hidden if viewing a specific section on mobile) */}
      <div className={`md:hidden ${mobileView === 'menu' ? 'flex' : 'hidden'} flex-col gap-3 mt-4`}>
        <Button 
          variant="outline" 
          className="h-14 justify-start text-sm px-4 glass-panel border-primary/20 shadow-sm"
          onClick={() => setMobileView('profile')}
        >
          <div className="bg-primary/10 p-2 rounded-lg mr-4">
            <User className="h-5 w-5 text-primary" />
          </div>
          {t.settings.profile}
        </Button>
        <Button 
          variant="outline" 
          className="h-14 justify-start text-sm px-4 glass-panel border-primary/20 shadow-sm"
          onClick={() => setMobileView('password')}
        >
          <div className="bg-primary/10 p-2 rounded-lg mr-4">
            <Settings2 className="h-5 w-5 text-primary" />
          </div>
          {t.settings.password}
        </Button>
        <Button 
          variant="outline" 
          className="h-14 justify-start text-sm px-4 glass-panel border-primary/20 shadow-sm"
          onClick={() => setMobileView('preferences')}
        >
          <div className="bg-primary/10 p-2 rounded-lg mr-4">
            <Settings2 className="h-5 w-5 text-primary" />
          </div>
          {t.settings.preferences}
        </Button>
        <Button 
          variant="outline" 
          className="h-14 justify-start text-sm px-4 glass-panel border-destructive/20 text-destructive shadow-sm"
          onClick={() => setIsLogoutOpen(true)}
        >
          <div className="bg-destructive/10 p-2 rounded-lg mr-4">
            <LogOut className="h-5 w-5 text-destructive" />
          </div>
          {t.settings.logout}
        </Button>
      </div>

      {/* Profile Section */}
      <Card className={`glass-panel ${mobileView === 'profile' ? 'block' : 'hidden md:block'}`}>
        <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-6">
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileView('menu')}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </Button>
          <div>
            <CardTitle className="flex items-center gap-2"><User className="h-5 w-5 text-primary" /> {t.settings.profile}</CardTitle>
            <CardDescription>{t.settings.profileDesc}</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>{t.settings.email}</Label>
            <Input disabled value={email} />
            <p className="text-xs text-muted-foreground">{t.settings.emailDesc}</p>
          </div>
          <div className="space-y-2">
            <Label>{t.settings.fullName}</Label>
            <Input 
              placeholder={t.settings.fullNamePlaceholder} 
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>
          <Button onClick={handleSaveProfile} disabled={isSaving}>
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {t.settings.saveChanges}
          </Button>
        </CardContent>
      </Card>

      {/* Password Section */}
      <Card className={`glass-panel ${mobileView === 'password' ? 'block' : 'hidden md:block'}`}>
        <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-6">
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileView('menu')}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </Button>
          <div>
            <CardTitle className="flex items-center gap-2"><Settings2 className="h-5 w-5 text-primary" /> {t.settings.password}</CardTitle>
            <CardDescription>{t.settings.passwordDesc}</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>{t.settings.newPassword}</Label>
            <Input 
              type="password" 
              placeholder={t.settings.newPasswordPlaceholder} 
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>{t.settings.confirmPassword}</Label>
            <Input 
              type="password" 
              placeholder={t.settings.confirmPasswordPlaceholder} 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
          <Button variant="outline" onClick={handleChangePassword} disabled={isChangingPassword || !newPassword}>
            {isChangingPassword ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {t.settings.updatePassword}
          </Button>
        </CardContent>
      </Card>

      {/* Preferences Section */}
      <Card className={`glass-panel ${mobileView === 'preferences' ? 'block' : 'hidden md:block'}`}>
        <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-6">
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileView('menu')}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </Button>
          <div>
            <CardTitle className="flex items-center gap-2"><Settings2 className="h-5 w-5 text-primary" /> {t.settings.preferences}</CardTitle>
            <CardDescription>{t.settings.preferencesDesc}</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="space-y-3">
            <Label>{t.settings.appearance}</Label>
            
            <div 
              className="relative flex items-center bg-secondary/50 rounded-full p-1 w-full max-w-xs cursor-pointer border border-border"
              onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
            >
              <div 
                className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-primary rounded-full shadow-md transition-transform duration-300 ease-in-out ${
                  resolvedTheme === 'dark' ? 'translate-x-[calc(100%+4px)]' : 'translate-x-0'
                }`} 
              />
              
              <div className={`flex-1 text-center z-10 flex items-center justify-center py-2.5 text-sm font-medium transition-colors ${resolvedTheme !== 'dark' ? 'text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
                <Sun className="h-4 w-4 mr-2" /> {t.settings.light}
              </div>
              <div className={`flex-1 text-center z-10 flex items-center justify-center py-2.5 text-sm font-medium transition-colors ${resolvedTheme === 'dark' ? 'text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
                <Moon className="h-4 w-4 mr-2" /> {t.settings.dark}
              </div>
            </div>
            
            <p className="text-xs text-muted-foreground">{t.settings.appearanceDesc}</p>
          </div>

          <div className="space-y-3 pt-4 border-t border-border">
            <Label>{t.settings.language}</Label>
            
            <div 
              className="relative flex items-center bg-secondary/50 rounded-full p-1 w-full max-w-xs cursor-pointer border border-border"
              onClick={() => setLocale(locale === 'en' ? 'bn' : 'en')}
            >
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
            
            <p className="text-xs text-muted-foreground">{t.settings.languageDesc}</p>
          </div>

          <div className="space-y-2 pt-4 border-t border-border">
            <Label>{t.settings.currency}</Label>
            <Input disabled value="Bangladeshi Taka (BDT / ৳)" />
            <p className="text-xs text-muted-foreground">{t.settings.currencyDesc}</p>
          </div>
        </CardContent>
      </Card>

      {/* Logout Section */}
      <Card className="glass-panel border-destructive/20 hidden md:block">
        <CardHeader className="pb-6">
          <CardTitle className="text-destructive">{t.settings.dangerZone}</CardTitle>
          <CardDescription>{t.settings.dangerZoneDesc}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="destructive" onClick={() => setIsLogoutOpen(true)}>
            <LogOut className="mr-2 h-4 w-4" /> {t.settings.logout}
          </Button>
        </CardContent>
      </Card>

      <ConfirmDialog
        isOpen={isLogoutOpen}
        onClose={() => !isLoggingOut && setIsLogoutOpen(false)}
        onConfirm={handleLogout}
        title={t.settings.logoutConfirmTitle}
        description={t.settings.logoutConfirmDesc}
        isDeleting={isLoggingOut}
        confirmText={t.settings.logout}
      />
    </div>
  );
}
