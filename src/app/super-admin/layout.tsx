import { ThemeProvider } from '@/components/theme-provider';
import { AdminThemeEnforcer } from '@/components/admin/admin-theme-enforcer';

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" forcedTheme="light">
      <AdminThemeEnforcer />
      <div className="force-light min-h-screen bg-background text-foreground">
        {children}
      </div>
    </ThemeProvider>
  );
}
