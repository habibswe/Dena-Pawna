'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';

export default function DashboardLoading() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-primary/10 rounded-lg animate-pulse glass-panel" />
          <div className="h-5 w-64 md:w-96 bg-muted/50 rounded-md animate-pulse" />
        </div>
        <div className="hidden sm:block h-10 w-48 bg-muted/30 rounded-md animate-pulse" />
      </div>

      {/* Floating Action Button mobile skeleton */}
      <div className="md:hidden fixed bottom-24 right-4 h-14 w-14 rounded-full bg-primary/50 animate-pulse z-50 shadow-lg" />

      {/* 5 Stat Cards */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4 lg:grid-cols-5">
        {Array(5).fill(0).map((_, i) => (
          <Card key={i} className={`glass-panel border-primary/10 ${i === 0 ? 'col-span-2 md:col-span-2 lg:col-span-1' : ''}`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 md:p-6">
              <div className="h-4 w-16 bg-muted rounded animate-pulse" />
              <div className="h-4 w-4 bg-muted rounded-full animate-pulse" />
            </CardHeader>
            <CardContent className="p-4 md:p-6 pt-0">
              <div className="h-6 md:h-8 w-20 md:w-24 bg-muted rounded animate-pulse mb-2" />
              <div className="h-3 w-16 bg-muted/50 rounded animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Pie Chart / Breakdown */}
        <div className="lg:col-span-1">
          <Card className="glass-panel h-[300px]">
            <CardHeader>
              <div className="h-5 w-32 bg-muted rounded animate-pulse" />
            </CardHeader>
            <CardContent className="flex items-center justify-center h-48">
              <div className="h-32 w-32 rounded-full border-8 border-muted/20 animate-pulse" />
            </CardContent>
          </Card>
        </div>

        {/* Money Flow */}
        <Card className="lg:col-span-2 glass-panel h-[300px]">
          <CardHeader>
            <div className="h-5 w-48 bg-muted rounded animate-pulse mb-1" />
            <div className="h-4 w-64 bg-muted/50 rounded animate-pulse" />
          </CardHeader>
          <CardContent className="space-y-4">
             {Array(4).fill(0).map((_, i) => (
               <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/10 ml-6">
                 <div className="flex items-center gap-3">
                   <div className="h-5 w-5 rounded bg-muted animate-pulse" />
                   <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                 </div>
                 <div className="h-4 w-20 bg-muted rounded animate-pulse" />
               </div>
             ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
