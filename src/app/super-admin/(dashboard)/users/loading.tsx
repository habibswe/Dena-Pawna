import { SkeletonHeader, SkeletonTable } from '@/components/ui/skeletons';

export default function AdminTableLoading() {
  return (
    <div className="space-y-6 w-full animate-in fade-in duration-300">
      <SkeletonHeader title subtitle button={false} />
      {/* Search Input Skeleton */}
      <div className="h-10 w-full md:w-96 bg-muted/50 rounded-md animate-pulse mb-4" />
      <SkeletonTable rows={8} cols={5} />
    </div>
  );
}
