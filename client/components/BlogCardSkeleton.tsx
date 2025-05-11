import { Skeleton } from '@/components/ui/skeleton';

const BlogCardSkeleton = () => {
  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow overflow-hidden h-[340px]">
      {/* Image skeleton */}
      <Skeleton className="w-full h-40 rounded-none" />
      
      {/* Content skeleton */}
      <div className="p-5">
        {/* Title skeleton */}
        <div className="mb-2">
          <Skeleton className="h-6 w-5/6 mb-1" />
          <Skeleton className="h-6 w-3/4" />
        </div>
        
        {/* Author/date skeleton */}
        <div className="mb-4 flex items-center">
          <Skeleton className="h-8 w-8 rounded-full mr-3" />
          <Skeleton className="h-4 w-32" />
        </div>
        
        {/* Description skeleton */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
        
        {/* Footer skeleton */}
        <div className="flex justify-between items-center mt-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-20 rounded-md" />
        </div>
      </div>
    </div>
  );
};

export default BlogCardSkeleton;