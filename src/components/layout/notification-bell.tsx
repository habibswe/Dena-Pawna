'use client';

import { useState, useEffect } from 'react';
import { Bell, Check, CheckCircle2, Trash2, X } from 'lucide-react';
import { getPendingNotifications } from '@/app/(dashboard)/notifications/actions';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from '@/lib/utils';
import { useTranslation } from '@/i18n/client';
import { format, parseISO } from 'date-fns';
import { Button } from '@/components/ui/button';

type NotificationItem = {
  id: string;
  type: string;
  amount: number;
  due_date: string;
  people: { name: string } | null;
  isTest?: boolean;
};

let toastFiredThisSession = false;

export function NotificationBell({ className }: { className?: string }) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);
  const { t } = useTranslation();

  // Load dismissed notifications from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('dismissed_notifications');
    if (saved) {
      try {
        setDismissedIds(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  useEffect(() => {
    async function fetchNotifications() {
      try {
        const { data, error } = await getPendingNotifications();
        let fetchedData = (!error && data) ? (data as any) : [];
        
        // Filter out dismissed notifications
        const activeNotifications = fetchedData.filter((item: NotificationItem) => !dismissedIds.includes(item.id));
        setNotifications(activeNotifications);

      } catch (e) {
        console.error("Failed to fetch notifications", e);
      }
    }
    
    // Only fetch if we have loaded the dismissed IDs from local storage (to prevent flash)
    fetchNotifications();
  }, [dismissedIds]);

  const handleDismiss = (id: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    
    const newDismissed = [...dismissedIds, id];
    setDismissedIds(newDismissed);
    localStorage.setItem('dismissed_notifications', JSON.stringify(newDismissed));
    
    setNotifications(prev => prev.filter(n => n.id !== id));
    toast.success("Notification cleared!");
  };

  const handleClearAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    const allIds = [...dismissedIds, ...notifications.map(n => n.id)];
    setDismissedIds(allIds);
    localStorage.setItem('dismissed_notifications', JSON.stringify(allIds));
    
    setNotifications([]);
    toast.success("All notifications cleared!");
  };

  // Show toast on initial load if there are notifications
  useEffect(() => {
    if (notifications.length > 0 && !toastFiredThisSession) {
      // Check sessionStorage in case of page reload (module state resets on hard reload)
      const sessionFired = sessionStorage.getItem('notification_toast_fired');
      
      if (!sessionFired) {
        toastFiredThisSession = true;
        sessionStorage.setItem('notification_toast_fired', 'true');
        
        // Small delay so it doesn't pop up instantly before UI settles
        const timer = setTimeout(() => {
          toast.info(
            `You have ${notifications.length} pending reminder${notifications.length > 1 ? 's' : ''}!`, 
            {
              description: "Check the bell icon for details.",
              duration: 6000,
            }
          );
        }, 1000);
        return () => clearTimeout(timer);
      }
    }
  }, [notifications]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger 
        className={cn(
          "relative p-2 rounded-full glass-panel hover:bg-primary/20 transition-all border border-primary/20 outline-none",
          notifications.length > 0 && "shadow-[0_0_15px_rgba(239,68,68,0.4)]",
          className
        )}
      >
        <Bell className="w-5 h-5 text-primary" />
        {notifications.length > 0 && (
          <span className="absolute top-0 right-0 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-destructive border-2 border-background"></span>
          </span>
        )}
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-80 glass-panel border-primary/20 !bg-background/95 backdrop-blur-2xl shadow-2xl z-50">
        <div className="px-3 py-2 flex items-center justify-between">
          <div className="font-bold text-lg text-foreground">Notifications</div>
          {notifications.length > 0 && (
            <button 
              onClick={handleClearAll}
              className="text-xs text-muted-foreground hover:text-destructive flex items-center gap-1 transition-colors bg-background/50 px-2 py-1 rounded-md"
            >
              <Trash2 className="w-3 h-3" /> Clear All
            </button>
          )}
        </div>
        <div className="h-px w-full bg-border/50 my-1" />
        
        <div className="max-h-[350px] overflow-y-auto pb-1">
          {notifications.length === 0 ? (
            <div className="p-6 flex flex-col items-center justify-center text-center space-y-3">
              <div className="bg-primary/10 p-3 rounded-full">
                <CheckCircle2 className="w-6 h-6 text-primary" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">
                You're all caught up!
              </p>
            </div>
          ) : (
            notifications.map((item) => {
              // Safely format the date
              let dateStr = '';
              try {
                dateStr = item.due_date ? format(parseISO(item.due_date), 'MMM d') : '';
              } catch (e) {
                dateStr = item.due_date || '';
              }

              return (
                <div key={item.id} className="relative group p-1">
                  <DropdownMenuItem 
                    className="flex flex-col items-start p-3 gap-1.5 focus:bg-primary/5 rounded-lg border border-transparent hover:border-primary/10 transition-all pr-8"
                  >
                    <div className="flex justify-between w-full items-center">
                      <span className="font-semibold text-primary flex items-center gap-1.5">
                        <div className={cn("w-2 h-2 rounded-full", item.type === 'GIVEN' ? "bg-emerald-500" : "bg-blue-500")} />
                        {item.type === 'GIVEN' ? 'Payment Expected' : 'Payment Due'}
                        {item.isTest && <span className="text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded ml-1">TEST</span>}
                      </span>
                      <span className="text-xs text-muted-foreground font-medium bg-background/50 px-1.5 py-0.5 rounded">
                        {dateStr}
                      </span>
                    </div>
                    <p className="text-sm text-foreground/80 leading-snug">
                      {item.type === 'GIVEN' 
                        ? `You are expected to receive ৳${item.amount} from ${item.people?.name || 'someone'}.`
                        : `You are expected to return ৳${item.amount} to ${item.people?.name || 'someone'}.`}
                    </p>
                  </DropdownMenuItem>
                  
                  {/* Clear single notification button */}
                  <button
                    onClick={(e) => handleDismiss(item.id, e)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-background/80 text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-all border border-border shadow-sm"
                    title="Dismiss"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
