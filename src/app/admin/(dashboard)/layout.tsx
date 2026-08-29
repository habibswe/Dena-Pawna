import Link from 'next/link';
import { LayoutDashboard, Users, ArrowLeftRight, LogOut, ShieldAlert, UserCog } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { logoutAdmin } from '../actions';

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col md:flex-row bg-background">
      {/* Admin Sidebar */}
      <aside className="w-full md:w-64 border-r bg-card px-4 py-6 flex flex-col justify-between">
        <div className="space-y-6">
          <div className="flex items-center gap-2 px-2 text-destructive">
            <ShieldAlert className="h-6 w-6" />
            <h1 className="text-xl font-bold tracking-tight">Super Admin</h1>
          </div>
          
          <nav className="space-y-1">
            <Link href="/admin">
              <Button variant="ghost" className="w-full justify-start text-foreground/80 hover:text-foreground">
                <LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard
              </Button>
            </Link>
            <Link href="/admin/people">
              <Button variant="ghost" className="w-full justify-start text-foreground/80 hover:text-foreground">
                <Users className="mr-2 h-4 w-4" /> People
              </Button>
            </Link>
            <Link href="/admin/transactions">
              <Button variant="ghost" className="w-full justify-start text-foreground/80 hover:text-foreground">
                <ArrowLeftRight className="mr-2 h-4 w-4" /> Transactions
              </Button>
            </Link>
            <Link href="/admin/users">
              <Button variant="ghost" className="w-full justify-start text-foreground/80 hover:text-foreground">
                <UserCog className="mr-2 h-4 w-4" /> System Users
              </Button>
            </Link>
          </nav>
        </div>

        <div className="pt-6 border-t mt-auto">
          <form action={logoutAdmin}>
            <Button variant="destructive" className="w-full justify-start" type="submit">
              <LogOut className="mr-2 h-4 w-4" /> Exit Admin
            </Button>
          </form>
        </div>
      </aside>

      {/* Admin Main Content */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto">
        <div className="mx-auto max-w-5xl space-y-6">
          {children}
        </div>
      </main>
    </div>
  );
}
