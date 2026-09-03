'use client';

import { useState, useEffect } from 'react';
import { Bell, Check, CheckCircle2, Trash2, X } from 'lucide-react';
import { getPendingNotifications } from '@/app/(dashboard)/notifications/actions';
import { confirmRecurringReminder, dismissRecurringReminder } from '@/app/(dashboard)/transactions/recurring-actions';
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
  people?: { name: string } | null;
  note?: string | null;
  recurrence?: string | null;
  categoryName?: string;
  accountName?: string;
  isRecurringReminder?: boolean;
  isTest?: boolean;
};

let toastFiredThisSession = false;

export function NotificationBell({ className }: { className?: string }) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);
  const { t } = useTranslation();

  // Load dismissed notifications and fetch notifications on mount
  useEffect(() => {
    let savedIds: string[] = [];
    const saved = localStorage.getItem('dismissed_notifications');
    if (saved) {
      try {
        savedIds = JSON.parse(saved);
        setDismissedIds(savedIds);
      } catch (e) {
        console.error(e);
      }
    }

    async function fetchNotifications() {
      try {
        const { data, error } = await getPendingNotifications();
        const fetchedData = (!error && data) ? (data as unknown as NotificationItem[]) : [];
        
        // Filter out dismissed notifications
        const activeNotifications = fetchedData.filter((item: NotificationItem) => !savedIds.includes(item.id));
        setNotifications(activeNotifications);
      } catch (e) {
        console.error("Failed to fetch notifications", e);
      }
    }
    
    fetchNotifications();
  }, []);

  const handleDismiss = (id: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    
    const newDismissed = [...dismissedIds, id];
    setDismissedIds(newDismissed);
    localStorage.setItem('dismissed_notifications', JSON.stringify(newDismissed));
    
    setNotifications(prev => prev.filter(n => n.id !== id));
    toast.success(t.notifications.notificationCleared);
  };

  const handleClearAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    const allIds = [...dismissedIds, ...notifications.map(n => n.id)];
    setDismissedIds(allIds);
    localStorage.setItem('dismissed_notifications', JSON.stringify(allIds));
    
    setNotifications([]);
    toast.success(t.notifications.allCleared);
  };

  const handleConfirmRecurring = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const res = await confirmRecurringReminder(id);
    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success(t.notifications.confirmed);
      setNotifications(prev => prev.filter(n => n.id !== id));
    }
  };

  const handleSkipRecurring = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const res = await dismissRecurringReminder(id);
    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success(t.notifications.skipped);
      setNotifications(prev => prev.filter(n => n.id !== id));
    }
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
            t.notifications.pendingReminders.replace('{count}', notifications.length.toString()), 
            {
              description: t.notifications.checkBell,
              duration: 6000,
            }
          );
        }, 1000);
        return () => clearTimeout(timer);
      }
    }
  }, [notifications, t.notifications]);

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
          <div className="font-bold text-lg text-foreground">{t.notifications.title}</div>
          {notifications.length > 0 && (
            <button 
              onClick={handleClearAll}
              className="text-xs text-muted-foreground hover:text-destructive flex items-center gap-1 transition-colors bg-background/50 px-2 py-1 rounded-md"
            >
              <Trash2 className="w-3 h-3" /> {t.notifications.clearAll}
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
                {t.notifications.allCaughtUp}
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

              const isRecurring = item.isRecurringReminder;
              const personName = item.people?.name || 'someone';
              const message = isRecurring
                ? t.notifications.recurringMessage.replace('{type}', item.type).replace('{amount}', item.amount.toString())
                : item.type === 'GIVEN'
                ? t.notifications.receiveMessage.replace('{amount}', item.amount.toString()).replace('{name}', personName)
                : t.notifications.returnMessage.replace('{amount}', item.amount.toString()).replace('{name}', personName);

              return (
                <div key={item.id} className="relative group p-1">
                  <DropdownMenuItem 
                    className="flex flex-col items-start p-3 gap-1.5 focus:bg-primary/5 rounded-lg border border-transparent hover:border-primary/10 transition-all pr-8 cursor-default"
                    onSelect={(e) => e.preventDefault()}
                  >
                    <div className="flex justify-between w-full items-center">
                      <span className="font-semibold text-primary flex items-center gap-1.5">
                        <div className={cn("w-2 h-2 rounded-full", isRecurring ? "bg-amber-500" : item.type === 'GIVEN' ? "bg-emerald-500" : "bg-blue-500")} />
                        {isRecurring ? t.notifications.recurringReminder : item.type === 'GIVEN' ? t.notifications.paymentExpected : t.notifications.paymentDue}
                        {item.isTest && <span className="text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded ml-1">TEST</span>}
                      </span>
                      <span className="text-xs text-muted-foreground font-medium bg-background/50 px-1.5 py-0.5 rounded">
                        {dateStr}
                      </span>
                    </div>
                    <p className="text-sm text-foreground/80 leading-snug">
                      {message}
                      {isRecurring && (item.categoryName || item.note) && (
                        <span className="block text-xs text-muted-foreground mt-0.5">
                          {item.categoryName ? `• ${item.categoryName}` : ''} {item.note ? `(${item.note})` : ''}
                        </span>
                      )}
                    </p>

                    {isRecurring && (
                      <div className="flex items-center gap-2 mt-2 w-full pt-1.5 border-t border-border/40">
                        <Button 
                          size="sm" 
                          variant="default"
                          className="h-7 text-xs bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-2.5 flex-1"
                          onClick={(e) => handleConfirmRecurring(item.id, e)}
                        >
                          <Check className="w-3 h-3 mr-1" />
                          {t.notifications.confirmAndAdd}
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="h-7 text-xs rounded-md px-2.5 text-muted-foreground hover:text-foreground"
                          onClick={(e) => handleSkipRecurring(item.id, e)}
                        >
                          {t.notifications.skip}
                        </Button>
                      </div>
                    )}
                  </DropdownMenuItem>
                  
                  {/* Clear single notification button */}
                  {!isRecurring && (
                    <button
                      onClick={(e) => handleDismiss(item.id, e)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-background/80 text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-all border border-border shadow-sm"
                      title="Dismiss"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
