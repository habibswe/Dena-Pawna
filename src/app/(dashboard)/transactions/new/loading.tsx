import { Card, CardContent } from '@/components/ui/card';

export default function LoadingNewTransaction() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex items-center gap-4">
        <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-primary/10 border border-primary/20 shrink-0" />
        <div className="space-y-2 flex-1">
          <div className="h-8 w-48 bg-primary/15 rounded-lg" />
          <div className="h-4 w-72 bg-muted-foreground/15 rounded-md" />
        </div>
      </div>

      {/* Form Card Skeleton */}
      <div className="pt-8 pb-10">
        <Card className="glass-panel w-full p-6 space-y-6">
          <CardContent className="space-y-6 p-0">
            {/* Field 1 */}
            <div className="space-y-2">
              <div className="h-4 w-28 bg-primary/10 rounded-md" />
              <div className="h-11 w-full bg-secondary/40 rounded-xl border border-primary/10" />
            </div>

            {/* Field 2 */}
            <div className="space-y-2">
              <div className="h-4 w-24 bg-primary/10 rounded-md" />
              <div className="h-11 w-full bg-secondary/40 rounded-xl border border-primary/10" />
            </div>

            {/* Field 3 */}
            <div className="space-y-2">
              <div className="h-4 w-32 bg-primary/10 rounded-md" />
              <div className="h-11 w-full bg-secondary/40 rounded-xl border border-primary/10" />
            </div>

            {/* Field 4 - Date */}
            <div className="space-y-2">
              <div className="h-4 w-20 bg-primary/10 rounded-md" />
              <div className="h-11 w-full bg-secondary/40 rounded-xl border border-primary/10" />
            </div>

            {/* Submit Button Skeleton */}
            <div className="h-12 w-full bg-primary/25 rounded-xl mt-8" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
