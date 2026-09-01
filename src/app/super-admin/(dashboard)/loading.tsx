import { Card, CardContent, CardHeader } from '@/components/ui/card';

export default function AdminDashboardLoading() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300 w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="space-y-2">
          <div className="h-8 w-64 bg-primary/10 rounded-lg animate-pulse glass-panel" />
          <div className="h-5 w-72 bg-muted/50 rounded-md animate-pulse" />
        </div>
        <div className="h-10 w-32 bg-muted/30 rounded-md animate-pulse" />
      </div>

      {/* 5 Global Financial Metrics */}
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
        {Array(5).fill(0).map((_, i) => (
          <Card key={`fin-${i}`} className={`glass-panel border-primary/10 ${i === 0 ? 'bg-primary/5' : ''}`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 md:p-6">
              <div className="h-4 w-24 bg-muted rounded animate-pulse" />
              <div className="h-4 w-4 bg-muted rounded-full animate-pulse" />
            </CardHeader>
            <CardContent className="p-4 md:p-6 pt-0">
              <div className="h-6 md:h-8 w-32 bg-muted rounded animate-pulse mb-2" />
              <div className="h-3 w-40 bg-muted/50 rounded animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 4 Stats Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array(4).fill(0).map((_, i) => (
          <Card key={`stat-${i}`} className="glass-panel border-primary/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 md:p-6">
              <div className="h-4 w-28 bg-muted rounded animate-pulse" />
              <div className="h-4 w-4 bg-muted rounded-full animate-pulse" />
            </CardHeader>
            <CardContent className="p-4 md:p-6 pt-0">
              <div className="h-6 md:h-8 w-24 bg-muted rounded animate-pulse mb-2" />
              <div className="h-3 w-36 bg-muted/50 rounded animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Two Lists: Recent Users & Recent Transactions */}
      <div className="grid gap-4 lg:grid-cols-2">
        {Array(2).fill(0).map((_, i) => (
          <Card key={`list-${i}`} className="glass-panel">
            <CardHeader className="flex flex-row items-center justify-between p-6">
              <div className="space-y-2">
                <div className="h-5 w-48 bg-muted rounded animate-pulse" />
                <div className="h-4 w-64 bg-muted/50 rounded animate-pulse" />
              </div>
              <div className="h-8 w-20 bg-muted/30 rounded-md animate-pulse" />
            </CardHeader>
            <CardContent className="p-6 pt-0 space-y-6">
               {Array(5).fill(0).map((_, j) => (
                 <div key={j} className="flex items-center">
                   <div className="h-9 w-9 rounded-full bg-muted animate-pulse" />
                   <div className="ml-4 space-y-2">
                     <div className="h-4 w-32 bg-muted rounded animate-pulse" />
                     <div className="h-3 w-48 bg-muted/50 rounded animate-pulse" />
                   </div>
                   <div className="ml-auto text-right space-y-2">
                     <div className="h-4 w-24 bg-muted rounded animate-pulse ml-auto" />
                     <div className="h-3 w-16 bg-muted/50 rounded animate-pulse ml-auto" />
                   </div>
                 </div>
               ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
