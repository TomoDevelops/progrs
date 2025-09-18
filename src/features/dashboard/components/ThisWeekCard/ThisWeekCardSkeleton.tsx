import { Skeleton } from "@/shared/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Calendar } from "lucide-react";

export const ThisWeekCardSkeleton = () => {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          This week
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-6">
          {/* Workouts skeleton */}
          <div className="flex items-center justify-between">
            <div>
              <Skeleton className="mb-1 h-8 w-12" />
              <Skeleton className="h-4 w-16" />
            </div>
            <Skeleton className="h-6 w-12 rounded-full" />
          </div>

          {/* Duration skeleton */}
          <div className="flex items-center justify-between">
            <div>
              <Skeleton className="mb-1 h-8 w-16" />
              <Skeleton className="h-4 w-14" />
            </div>
            <Skeleton className="h-6 w-12 rounded-full" />
          </div>

          {/* Volume skeleton */}
          <div className="flex items-center justify-between">
            <div>
              <Skeleton className="mb-1 h-8 w-20" />
              <Skeleton className="h-4 w-20" />
            </div>
            <Skeleton className="h-6 w-12 rounded-full" />
          </div>
        </div>

        {/* Comparison note skeleton */}
        <div className="mt-6 border-t border-gray-100 pt-4">
          <Skeleton className="mx-auto h-3 w-32" />
        </div>
      </CardContent>
    </Card>
  );
};
