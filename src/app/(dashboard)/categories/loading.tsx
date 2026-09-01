import { SkeletonHeader, SkeletonCategories } from '@/components/ui/skeletons';

export default function Loading() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300 w-full">
      <SkeletonHeader title subtitle button />
      <SkeletonCategories />
    </div>
  );
}
