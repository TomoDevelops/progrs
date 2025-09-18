"use client";

import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Repeat } from "lucide-react";
import { Header } from "@/shared/components/Header";
import type { UseDashboardReturn } from "@/features/dashboard/hooks/useDashboard";
import { useDashboardData } from "@/features/dashboard/hooks/useDashboardData";
import { useActiveSession } from "@/features/dashboard/hooks/useActiveSession";
import { useWeeklyStats } from "@/features/dashboard/hooks/useWeeklyStats";
import { CreateWorkoutRoutineDialog } from "@/features/workout-routines/components/CreateWorkoutRoutineDialog";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type {
  WorkoutHistoryItem,
  TodayWorkoutData,
} from "@/app/api/dashboard/repository/dashboard.repository";
import { WorkoutDetailModal } from "@/features/dashboard/components/WorkoutDetailModal/WorkoutDetailModal";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { TodayWorkoutCard } from "@/features/dashboard/components/TodayWorkoutCard";
import { ThisWeekCard } from "@/features/dashboard/components/ThisWeekCard";
import { formatDateForLocale } from "@/shared/utils/date";
import { ProgressChart } from "@/features/dashboard/components/ProgressChart";
import { CalendarHeatmap } from "@/features/dashboard/components/CalendarHeatmap";
import { ProgressBadges } from "@/features/dashboard/components/ProgressBadges/ProgressBadges";
import { TodayWorkoutCardSkeleton } from "@/features/dashboard/components/TodayWorkoutCard/TodayWorkoutCardSkeleton";
import { ThisWeekCardSkeleton } from "@/features/dashboard/components/ThisWeekCard/ThisWeekCardSkeleton";
import { ProgressChartSkeleton } from "@/features/dashboard/components/ProgressChart/ProgressChartSkeleton";
import { CalendarHeatmapSkeleton } from "@/features/dashboard/components/CalendarHeatmap/CalendarHeatmapSkeleton";
import { ProgressBadgesSkeleton } from "@/features/dashboard/components/ProgressBadges/ProgressBadgesSkeleton";
import { WorkoutHistorySkeleton } from "@/features/dashboard/components/WorkoutHistorySkeleton/WorkoutHistorySkeleton";
import { WorkoutHistoryEmpty } from "@/features/dashboard/components/WorkoutHistoryEmpty/WorkoutHistoryEmpty";
import { DashboardSkeleton } from "@/features/dashboard/components/DashboardSkeleton";
import { ErrorBoundary } from "@/features/dashboard/components/ErrorBoundary";
import { DashboardErrorFallback } from "@/features/dashboard/components/DashboardErrorFallback";

interface DashboardContentProps {
  dashboardState: UseDashboardReturn;
}

export const DashboardContent = ({ dashboardState }: DashboardContentProps) => {
  const { user, isLoading: authLoading, handleSignOut } = dashboardState;
  const {} = useActiveSession();
  const router = useRouter();
  const {
    currentWeek,
    lastWeek,
    isLoading: weeklyStatsLoading,
  } = useWeeklyStats();

  // Only enable data fetching when user is authenticated and not loading
  const isDataEnabled = !!user && !authLoading;

  const { stats, todayWorkouts, history, consistency, isError, error } =
    useDashboardData(isDataEnabled);
  const [selectedWorkout, setSelectedWorkout] =
    useState<WorkoutHistoryItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [, setIsStartingWorkout] = useState(false);
  const [selectedWorkoutIndex, setSelectedWorkoutIndex] = useState(0);
  const queryClient = useQueryClient();

  const handleWorkoutClick = (workout: WorkoutHistoryItem) => {
    setSelectedWorkout(workout);
    setIsModalOpen(true);
  };

  const handleRepeatWorkout = async (
    workout: WorkoutHistoryItem,
    e: React.MouseEvent,
  ) => {
    e.stopPropagation();
    if (!workout.id) {
      toast.error("Invalid workout selected");
      return;
    }

    try {
      const response = await fetch("/api/workout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "repeat",
          sessionId: workout.id,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to repeat workout");
      }

      const result = await response.json();
      if (result.success && result.data?.sessionId) {
        toast.success("Workout repeated!");
        router.push(`/workout-session/${result.data.sessionId}`);
        return;
      }
      throw new Error(result.error || "Failed to repeat workout");
    } catch (error) {
      console.error("Error repeating workout:", error);
      toast.error("Failed to repeat workout. Please try again.");
    }
  };

  const handleStartWorkout = async (workout: TodayWorkoutData) => {
    if (!workout.id) {
      toast.error("Invalid workout selected");
      return;
    }

    setIsStartingWorkout(true);
    try {
      const response = await fetch("/api/workout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "create",
          routineId: workout.id,
          name: workout.name,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to start workout");
      }

      const result = await response.json();
      if (result.success && result.data?.sessionId) {
        toast.success("Workout started!");
        router.push(`/workout-session/${result.data.sessionId}`);
        return;
      }
      throw new Error(result.error || "Failed to start workout");
    } catch (error) {
      console.error("Error starting workout:", error);
      toast.error("Failed to start workout. Please try again.");
    } finally {
      setIsStartingWorkout(false);
    }
  };

  // Show full skeleton during initial auth loading
  if (authLoading) {
    return <DashboardSkeleton />;
  }

  if (isError) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-red-600">
            Error loading dashboard
          </h2>
          <p className="text-sm text-gray-600">
            {error?.message || "Something went wrong"}
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const currentHour = new Date().getHours();
  const greeting =
    currentHour < 12 ? "morning" : currentHour < 18 ? "afternoon" : "evening";
  const userLocale =
    typeof navigator !== "undefined" ? navigator.language : "en-US";
  const currentDate = formatDateForLocale(new Date(), userLocale, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <Header
        onSignOut={handleSignOut}
        onStartWorkout={() => {
          const selectedWorkout = todayWorkouts.data?.[selectedWorkoutIndex];
          if (selectedWorkout) {
            handleStartWorkout(selectedWorkout);
          }
        }}
        hasWorkoutsToday={
          !!(todayWorkouts.data && todayWorkouts.data.length > 0)
        }
      />

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Account Email Verification */}
        {!user.emailVerified && (
          <div className="mb-6">
            <Card className="border-orange-200 bg-orange-50 py-0">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-orange-800">
                      Verify your email
                    </h3>
                    <p className="mt-1 text-sm text-orange-600">
                      Please verify your email address to access all features.
                    </p>
                  </div>
                  <Button
                    variant="default"
                    size="sm"
                    radius="default"
                    className="bg-orange-600 hover:bg-orange-700"
                  >
                    Verify now
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
        {/* Header Section with Hero CTA */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="flex items-center gap-2 text-3xl font-bold text-gray-900">
                Good {greeting}, {user.name || user.username}!
                <Image
                  src="/wave.png"
                  alt="Hand waving icon"
                  className="hidden rounded-full lg:block"
                  height={32}
                  width={32}
                />
              </h1>
              <p className="mt-2 text-gray-600">{currentDate}</p>
            </div>

            {/* Hero CTA - Start/Resume Logic */}
            <div className="flex items-center gap-4">
              <CreateWorkoutRoutineDialog
                trigger={
                  <Button variant="outline" size="lg" className="h-12">
                    Create routine
                  </Button>
                }
                onSuccess={() => {
                  queryClient.invalidateQueries({ queryKey: ["dashboard"] });
                }}
              />
            </div>
          </div>
        </div>

        {/* Row 1 - Today's Workout (2/3) and This Week KPIs (1/3) */}
        <div className="my-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Today's Workout Card - 2/3 width */}
          <div className="lg:col-span-2">
            <ErrorBoundary
              fallback={(props) => (
                <DashboardErrorFallback
                  {...props}
                  title="Failed to load today's workout"
                  queryKey={["dashboard", "todayWorkouts"]}
                />
              )}
            >
              {todayWorkouts.isLoading ? (
                <TodayWorkoutCardSkeleton />
              ) : (
                <TodayWorkoutCard
                  workouts={todayWorkouts.data || []}
                  selectedIndex={selectedWorkoutIndex}
                  onWorkoutIndexChange={setSelectedWorkoutIndex}
                />
              )}
            </ErrorBoundary>
          </div>

          {/* This Week KPIs Card - 1/3 width */}
          <div className="lg:col-span-1">
            <ErrorBoundary
              fallback={(props) => (
                <DashboardErrorFallback
                  {...props}
                  title="Failed to load weekly stats"
                  queryKey={["weeklyStats"]}
                />
              )}
            >
              {weeklyStatsLoading ? (
                <ThisWeekCardSkeleton />
              ) : (
                <ThisWeekCard
                  currentWeek={
                    currentWeek || { workouts: 0, duration: 0, volume: 0 }
                  }
                  lastWeek={lastWeek}
                />
              )}
            </ErrorBoundary>
          </div>
        </div>

        {/* Row 2 - Progress Chart (full width) */}
        <div className="my-6">
          <ErrorBoundary
            fallback={(props) => (
              <DashboardErrorFallback
                {...props}
                title="Failed to load progress chart"
                queryKey={["dashboard", "consistency"]}
              />
            )}
          >
            {consistency.isLoading ? (
              <ProgressChartSkeleton />
            ) : (
              <ProgressChart />
            )}
          </ErrorBoundary>
        </div>

        {/* Row 3 - Recent Workouts (left) and Progress Moments/Heatmap (right) */}
        <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Workout History Feed - Left Column */}
          <ErrorBoundary
            fallback={(props) => (
              <DashboardErrorFallback
                {...props}
                title="Failed to load workout history"
                queryKey={["dashboard", "history"]}
              />
            )}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="text-lg font-medium tracking-wide">
                    Recent Workouts
                  </span>
                  <Button variant="ghost" size="sm">
                    View All
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {history.isLoading ? (
                  <WorkoutHistorySkeleton count={3} />
                ) : history.data && history.data.length > 0 ? (
                  history.data.slice(0, 3).map((workout, index) => {
                    const exerciseImages = [
                      "/all-in-one-training.png",
                      "/barbell.png",
                      "/dumbbell.png",
                    ];
                    const imageIndex = index % exerciseImages.length;

                    return (
                      <div
                        key={workout.id}
                        className="group flex cursor-pointer items-center space-x-4 rounded-lg bg-gray-50 p-3 transition-colors hover:bg-gray-100"
                        onClick={() => handleWorkoutClick(workout)}
                      >
                        <div className="relative h-8 w-8">
                          <Image
                            src={exerciseImages[imageIndex]}
                            alt="Exercise type"
                            width={32}
                            height={32}
                            className="object-contain"
                          />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">{workout.routineName}</h4>
                          <p className="text-sm text-gray-600">
                            {workout.endedAt
                              ? formatDateForLocale(
                                  new Date(workout.endedAt),
                                  userLocale,
                                  {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                  },
                                )
                              : "In progress"}{" "}
                            •
                            {workout.totalDuration
                              ? `${workout.totalDuration} min`
                              : "Duration not recorded"}
                          </p>
                          <p className="text-sm font-medium text-blue-600">
                            {workout.totalSets} sets • {workout.totalExercises}{" "}
                            exercises
                          </p>
                        </div>
                        <div className="flex items-center space-x-1 opacity-0 transition-opacity group-hover:opacity-100">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 hover:bg-blue-100 hover:text-blue-600"
                            onClick={(e) => handleRepeatWorkout(workout, e)}
                            title="Repeat workout"
                          >
                            <Repeat className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })
                ) : history.data && history.data.length === 0 ? (
                  <WorkoutHistoryEmpty />
                ) : null}
              </CardContent>
            </Card>
          </ErrorBoundary>

          {/* Progress Moments and Activity Heatmap - Right Column */}
          <div className="space-y-6">
            {/* Progress Badges/Moments */}
            <ErrorBoundary
              fallback={(props) => (
                <DashboardErrorFallback
                  {...props}
                  title="Failed to load progress badges"
                  queryKey={["dashboard", "stats"]}
                />
              )}
            >
              {stats.isLoading ? (
                <ProgressBadgesSkeleton />
              ) : (
                <ProgressBadges />
              )}
            </ErrorBoundary>

            {/* Activity Heatmap */}
            <ErrorBoundary
              fallback={(props) => (
                <DashboardErrorFallback
                  {...props}
                  title="Failed to load activity heatmap"
                  queryKey={["dashboard", "consistency"]}
                />
              )}
            >
              {consistency.isLoading ? (
                <CalendarHeatmapSkeleton />
              ) : (
                <CalendarHeatmap data={consistency.data || []} />
              )}
            </ErrorBoundary>
          </div>
        </div>
      </main>

      {/* Workout Detail Modal */}
      <WorkoutDetailModal
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        selectedWorkout={selectedWorkout}
      />
    </div>
  );
};
