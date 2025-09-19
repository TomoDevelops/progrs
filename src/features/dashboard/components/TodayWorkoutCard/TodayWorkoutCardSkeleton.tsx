import { Skeleton } from "@/shared/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Calendar } from "lucide-react";

export const TodayWorkoutCardSkeleton = () => {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Today&apos;s Workout
            <Skeleton className="ml-2 h-5 w-16 rounded-full" />
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Workout */}
        <div className="space-y-3">
          <div>
            <Skeleton className="mb-2 h-6 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>

          {/* Workout Stats */}
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-4 w-12" />
            </div>
            <div className="flex items-center gap-1">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-4 w-16" />
            </div>
          </div>

          {/* Exercise Preview */}
          <div className="space-y-2">
            <Skeleton className="mb-2 h-4 w-20" />
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 3 }).map((_, index) => (
                <Skeleton key={index} className="h-6 w-20 rounded-full" />
              ))}
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
          </div>
        </div>
      </CardContent>

      {/* Navigation Controls Skeleton */}
      <CardFooter className="mt-auto w-full">
        <div className="flex w-full items-center justify-between">
          <Skeleton className="h-8 w-20" />

          {/* Workout Indicators */}
          <div className="flex items-center gap-2">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-2 w-2 rounded-full" />
            ))}
          </div>

          <Skeleton className="h-8 w-16" />
        </div>
      </CardFooter>
    </Card>
  );
};
