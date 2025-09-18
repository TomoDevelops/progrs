import { Skeleton } from "@/shared/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";

export const CalendarHeatmapSkeleton = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="text-lg font-medium tracking-wide">
            Activity Heatmap
          </span>
          <Skeleton className="h-8 w-20" />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Week labels skeleton */}
          <div className="flex justify-between">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-12" />
          </div>

          {/* Calendar grid skeleton */}
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, weekIndex) => (
              <div key={weekIndex} className="flex gap-2">
                {Array.from({ length: 7 }).map((_, dayIndex) => (
                  <Skeleton
                    key={dayIndex}
                    className="aspect-square min-h-[16px] flex-1 rounded-md"
                  />
                ))}
              </div>
            ))}
          </div>

          {/* Legend skeleton */}
          <div className="flex items-center justify-between pt-4">
            <div className="flex items-center gap-3">
              <Skeleton className="h-3 w-8" />
              <div className="flex gap-1.5">
                {Array.from({ length: 5 }).map((_, level) => (
                  <Skeleton
                    key={level}
                    className="h-4 w-4 rounded-md md:h-3 md:w-3"
                  />
                ))}
              </div>
              <Skeleton className="h-3 w-8" />
            </div>

            <Skeleton className="h-3 w-24" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
