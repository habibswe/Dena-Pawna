import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export default function DashboardLoading() {
  return (
    <div className="space-y-6 max-w-4xl animate-in fade-in duration-500 w-full">
      {/* Skeleton Header */}
      <div className="space-y-2">
        <div className="h-10 w-48 bg-primary/10 rounded-lg animate-pulse glass-panel" />
        <div className="h-5 w-64 md:w-96 bg-muted/50 rounded-md animate-pulse" />
      </div>

      {/* Skeleton Top Cards */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="glass-panel border-primary/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 md:p-6">
              <div className="h-4 w-16 bg-muted rounded animate-pulse" />
              <div className="h-4 w-4 bg-muted rounded-full animate-pulse" />
            </CardHeader>
            <CardContent className="p-4 md:p-6 pt-0">
              <div className="h-6 md:h-8 w-20 md:w-24 bg-muted rounded animate-pulse mb-2" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Loading Spinner Area */}
      <Card className="glass-panel border-primary/10 mt-6 min-h-[300px] flex items-center justify-center">
        <CardContent className="p-12 flex flex-col items-center justify-center space-y-6 text-center">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse" />
            <Loader2 className="w-12 h-12 text-primary animate-spin relative z-10" />
          </div>
          <p className="text-muted-foreground animate-pulse text-lg font-medium">Loading data...</p>
        </CardContent>
      </Card>
    </div>
  );
}
