import { Skeleton } from "@/shared/components/ui/skeleton";

export const ProgressChartSkeleton = () => {
  return (
    <div className="space-y-6">
      {/* Controls skeleton */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Skeleton className="h-10 w-full sm:w-[250px]" />
        <Skeleton className="h-10 w-full sm:w-[120px]" />
      </div>
      
      {/* Chart skeleton */}
      <div className="h-64 w-full">
        <div className="flex h-full">
          {/* Y-axis area */}
          <div className="flex w-10 flex-col justify-between py-4">
            <Skeleton className="h-3 w-6" />
            <Skeleton className="h-3 w-6" />
            <Skeleton className="h-3 w-6" />
            <Skeleton className="h-3 w-6" />
            <Skeleton className="h-3 w-6" />
          </div>
          
          {/* Chart area */}
          <div className="flex-1 relative">
            {/* Grid lines */}
            <div className="absolute inset-0 flex flex-col justify-between py-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-px w-full opacity-30" />
              ))}
            </div>
            
            {/* Data line simulation */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex items-end justify-between w-full px-4 h-32">
                {Array.from({ length: 7 }).map((_, i) => (
                  <Skeleton key={i} className="h-2 w-2 rounded-full" />
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* X-axis labels */}
        <div className="flex justify-between pl-10 pr-4 mt-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-3 w-8" />
          ))}
        </div>
      </div>
    </div>
  );
};