import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton'; // Assuming this exists or I will create it. Wait, I should just use Tailwind animate-pulse directly to match Dena-Pawna style.

export function SkeletonHeader({ title = true, subtitle = true, button = false }: { title?: boolean, subtitle?: boolean, button?: boolean }) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <div className="space-y-2">
        {title && <div className="h-8 w-48 bg-primary/10 rounded-lg animate-pulse glass-panel" />}
        {subtitle && <div className="h-4 w-64 md:w-96 bg-muted/50 rounded-md animate-pulse" />}
      </div>
      {button && <div className="h-10 w-32 bg-primary/20 rounded-md animate-pulse" />}
    </div>
  );
}

export function SkeletonTable({ rows = 5, cols = 5 }: { rows?: number, cols?: number }) {
  return (
    <Card className="glass-panel">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="space-y-2">
          <div className="h-6 w-32 bg-muted rounded animate-pulse" />
          <div className="h-4 w-48 bg-muted/50 rounded animate-pulse" />
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="relative overflow-x-auto border-y">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 border-b">
              <tr>
                {Array(cols).fill(0).map((_, i) => (
                  <th key={i} className="px-6 py-4">
                    <div className="h-4 w-20 bg-muted/70 rounded animate-pulse" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array(rows).fill(0).map((_, i) => (
                <tr key={i} className="border-b border-border/50">
                  {Array(cols).fill(0).map((_, j) => (
                    <td key={j} className="px-6 py-4">
                      <div className={`h-4 bg-muted/50 rounded animate-pulse ${j === 0 ? 'w-16' : j === cols - 1 ? 'w-8 ml-auto' : 'w-24'}`} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4 flex justify-between items-center">
          <div className="h-4 w-24 bg-muted/50 rounded animate-pulse" />
          <div className="flex gap-2">
            <div className="h-8 w-8 bg-muted/50 rounded animate-pulse" />
            <div className="h-8 w-8 bg-muted/50 rounded animate-pulse" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function SkeletonList({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-4">
      {/* Search Bar Skeleton */}
      <div className="h-10 w-full sm:w-96 bg-muted/50 rounded-md animate-pulse mb-6" />
      
      {/* List Items Skeleton */}
      {Array(rows).fill(0).map((_, i) => (
        <Card key={i} className="glass-panel p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 bg-primary/10 rounded-full animate-pulse" />
            <div className="space-y-2">
              <div className="h-5 w-32 bg-muted rounded animate-pulse" />
              <div className="h-3 w-24 bg-muted/50 rounded animate-pulse" />
            </div>
          </div>
          <div className="space-y-2 text-right flex flex-col items-end">
            <div className="h-5 w-20 bg-muted rounded animate-pulse" />
            <div className="h-3 w-12 bg-muted/50 rounded animate-pulse" />
          </div>
        </Card>
      ))}
    </div>
  );
}

export function SkeletonCards({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      {Array(count).fill(0).map((_, i) => (
        <Card key={i} className="glass-panel">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="h-5 w-24 bg-muted rounded animate-pulse" />
            <div className="h-8 w-8 bg-primary/10 rounded-full animate-pulse" />
          </CardHeader>
          <CardContent>
            <div className="h-8 w-32 bg-muted rounded animate-pulse mb-4" />
            <div className="space-y-2">
              <div className="h-3 w-full bg-muted/50 rounded animate-pulse" />
              <div className="h-3 w-4/5 bg-muted/50 rounded animate-pulse" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function SkeletonForm() {
  return (
    <Card className="glass-panel w-full">
      <CardHeader>
        <div className="h-6 w-48 bg-muted rounded animate-pulse mb-2" />
        <div className="h-4 w-64 bg-muted/50 rounded animate-pulse" />
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Fields */}
        {Array(4).fill(0).map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="h-4 w-24 bg-muted rounded animate-pulse" />
            <div className="h-10 w-full bg-muted/30 rounded-md animate-pulse border border-border" />
          </div>
        ))}
        {/* Submit Button */}
        <div className="pt-4">
          <div className="h-10 w-full bg-primary/50 rounded-md animate-pulse" />
        </div>
      </CardContent>
    </Card>
  );
}

export function SkeletonTransactionGrid() {
  return (
    <Card className="glass-panel w-full">
      <CardContent className="pt-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array(8).fill(0).map((_, i) => (
            <div
              key={i}
              className="flex flex-col items-center justify-center p-5 sm:p-6 gap-3 sm:gap-4 rounded-xl border glass-panel relative overflow-hidden"
            >
              <div className="p-3 rounded-full bg-muted/30 h-14 w-14 animate-pulse" />
              <div className="h-4 w-20 bg-muted/40 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
