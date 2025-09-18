import { Skeleton } from "@/shared/components/ui/skeleton";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Header } from "@/shared/components/Header";
import Image from "next/image";

export const DashboardSkeleton = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header Skeleton */}
      <Header
        onSignOut={() => {}}
        onStartWorkout={() => {}}
        hasWorkoutsToday={false}
      />

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="mb-8">
          <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Skeleton className="h-9 w-64" />
                <Image
                  src="/wave.png"
                  alt="Hand waving icon"
                  className="hidden rounded-full lg:block"
                  height={32}
                  width={32}
                />
              </div>
              <Skeleton className="mt-2 h-6 w-48" />
            </div>

            {/* Hero CTA */}
            <div className="flex items-center gap-4">
              <Button variant="outline" size="lg" className="h-12" disabled>
                Create routine
              </Button>
            </div>
          </div>
        </div>

        {/* Row 1 - Today's Workout (2/3) and This Week KPIs (1/3) */}
        <div className="my-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Today's Workout Card - 2/3 width */}
          <div className="lg:col-span-2">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Skeleton className="h-5 w-5" />
                  <Skeleton className="h-6 w-32" />
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Workout title skeleton */}
                <div>
                  <Skeleton className="mb-2 h-6 w-48" />
                  <Skeleton className="h-4 w-32" />
                </div>

                {/* Exercise list skeleton */}
                <div className="space-y-2">
                  <Skeleton className="mb-2 h-4 w-20" />
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Skeleton className="h-2 w-2 rounded-full" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  ))}
                </div>

                {/* Workout details skeleton */}
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

                {/* Start button skeleton */}
                <Skeleton className="h-12 w-full rounded-lg" />
              </CardContent>
            </Card>
          </div>

          {/* This Week KPIs Card - 1/3 width */}
          <div className="lg:col-span-1">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Skeleton className="h-5 w-5" />
                  <Skeleton className="h-6 w-24" />
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Stats grid */}
                <div className="grid grid-cols-1 gap-4">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="text-center">
                      <Skeleton className="mx-auto mb-2 h-8 w-16" />
                      <Skeleton className="mx-auto h-4 w-20" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Row 2 - Progress Chart (full width) */}
        <div className="my-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-8 w-20" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
        </div>

        {/* Row 3 - Recent Workouts (left) and Progress Moments/Heatmap (right) */}
        <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Workout History Feed - Left Column */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-8 w-16" />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 rounded-lg border p-4"
                >
                  <Skeleton className="h-12 w-12 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-24" />
                    <div className="flex gap-2">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                  </div>
                  <Skeleton className="h-8 w-8" />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Progress Moments/Heatmap - Right Column */}
          <div className="space-y-6">
            {/* Progress Badges */}
            <Card>
              <CardHeader>
                <CardTitle>
                  <Skeleton className="h-6 w-32" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <div className="flex-1">
                        <Skeleton className="mb-1 h-4 w-16" />
                        <Skeleton className="h-3 w-12" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Calendar Heatmap */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-8 w-20" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Array.from({ length: 7 }).map((_, weekIndex) => (
                    <div key={weekIndex} className="flex gap-1">
                      {Array.from({ length: 7 }).map((_, dayIndex) => (
                        <Skeleton
                          key={dayIndex}
                          className="h-3 w-3 rounded-sm"
                        />
                      ))}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
