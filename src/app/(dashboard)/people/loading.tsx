import { SkeletonHeader, SkeletonList } from '@/components/ui/skeletons';

export default function PeopleLoading() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300 w-full">
      <SkeletonHeader title subtitle button />
      <SkeletonList rows={6} />
    </div>
  );
}
