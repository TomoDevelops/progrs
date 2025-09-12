"use client";

import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import {
  Settings,
  LogOut,
  Target,
  Play,
  Clock,
  BarChart3,
  Loader2,
  Dumbbell,
} from "lucide-react";
import { useState } from "react";
import type { UseDashboardReturn } from "@/features/dashboard/hooks/useDashboard";
import { useDashboardData } from "@/features/dashboard/hooks/useDashboardData";
import Image from "next/image";

interface DashboardContentProps {
  dashboardState: UseDashboardReturn;
}

export const DashboardContent = ({ dashboardState }: DashboardContentProps) => {
  const { user, isLoading: authLoading, handleSignOut } = dashboardState;
  const {
    stats,
    today,
    history,
    consistency,
    isLoading: dataLoading,
    isError,
    error,
  } = useDashboardData();

  const isLoading = authLoading || dataLoading;

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
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

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const currentHour = new Date().getHours();
  const greeting =
    currentHour < 12 ? "morning" : currentHour < 18 ? "afternoon" : "evening";
  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const todaysWorkout = today.data || {
    name: "No workout planned",
    description: "Plan your workout for today",
    estimatedDuration: null,
    exercises: [],
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-blue-600 to-purple-600">
                <span className="text-sm font-bold text-white">P</span>
              </div>
              <span className="ml-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-xl font-semibold text-transparent">
                Progrs
              </span>
            </div>

            <div className="flex items-center space-x-4">
              <Button className="h-10 rounded-full bg-white text-black hover:bg-gray-50 has-[>svg]:px-5">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Button>
              <Button
                className="h-10 rounded-full bg-white text-black hover:bg-gray-50 has-[>svg]:px-5"
                onClick={handleSignOut}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </Button>
            </div>
          </div>
        </div>
      </header>

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
                    size="sm"
                    className="bg-orange-600 hover:bg-orange-700"
                  >
                    Verify now
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
        {/* Header Section */}
        <div className="mb-8">
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

        {/* Quick Start Button */}
        <div className="flex items-center justify-end">
          <Button
            size="lg"
            className="h-14 w-40 rounded-full bg-slate-900 shadow-lg hover:bg-slate-800"
          >
            <Dumbbell className="h-9 w-9" />
            <p className="text-sm text-white">Create New</p>
          </Button>
        </div>

        {/* Top Row - Today's Workout, Quick Start, Daily Goal */}
        <div className="my-8 grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Today's Planned Workout Card */}
          <Card className="justify-between border-0 text-black lg:col-span-5">
            <CardHeader>
              <div className="flex justify-between">
                <CardTitle className="text-lg font-medium tracking-wide">
                  Today&apos;s Workout
                </CardTitle>
                <p className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="inline h-4 w-4" />
                  {todaysWorkout.estimatedDuration
                    ? `${todaysWorkout.estimatedDuration} min`
                    : "Duration not set"}
                </p>
              </div>
              <CardDescription className="text-blue-600">
                {todaysWorkout.description || todaysWorkout.name}
              </CardDescription>
            </CardHeader>
            <CardFooter className="justify-between">
              <Button
                // Disable start workout button if no workout is scheduled
                disabled={todaysWorkout.estimatedDuration === null}
                className="flex h-10 gap-2 rounded-full bg-gray-700 text-gray-50 hover:bg-gray-600 has-[>svg]:px-4"
              >
                <Play className="h-4 w-4" />
                Start Workout
              </Button>
              <div className="text-6xl opacity-50">
                <Image
                  src="/muscle.png"
                  alt="Muscle icon"
                  height={50}
                  width={50}
                />
              </div>
            </CardFooter>
          </Card>

          {/* Summary Stats */}
          <Card className="border-0 text-black lg:col-span-7">
            <CardHeader>
              <CardTitle className="text-lg font-medium tracking-wide">
                Your Progress
              </CardTitle>
              <CardDescription className="text-green-600">
                Keep up the great work!
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* TODO: Change this to a chart of progress over time */}
              {/* Pill shaped select for a weekly/monthly/yearly view */}
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Target className="mr-2 h-4 w-4" />
                    <span className="text-sm">
                      Total Workouts: {stats.data?.totalWorkouts || 0}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <BarChart3 className="mr-2 h-4 w-4" />
                    <span className="text-sm">
                      Current Streak: {stats.data?.currentStreak || 0} days
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="mr-2 h-4 w-4" />
                    <span className="text-sm">
                      Avg Duration: {stats.data?.averageDuration || 0} min
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="justify-between">
              <Button className="flex h-10 gap-2 rounded-full bg-gray-700 text-gray-50 hover:bg-gray-600 has-[>svg]:px-4">
                View Details
              </Button>
              <div className="text-6xl opacity-50">
                <Image
                  src="/chart.png"
                  alt="Chart icon"
                  height={55}
                  width={55}
                />
              </div>
            </CardFooter>
          </Card>
        </div>

        {/* Middle Row - Workout History, Stats, and Trending Metrics */}
        <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Workout History Feed */}
          <Card className="lg:col-span-4">
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
              {history.data && history.data.length > 0 ? (
                history.data.map((workout) => (
                  <div
                    key={workout.id}
                    className="flex items-center space-x-4 rounded-lg bg-gray-50 p-3"
                  >
                    <div className="text-2xl">🏋️</div>
                    <div className="flex-1">
                      <h4 className="font-medium">{workout.routineName}</h4>
                      <p className="text-sm text-gray-600">
                        {workout.endedAt
                          ? new Date(workout.endedAt).toLocaleDateString()
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
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-600">
                  No recent workouts found
                </p>
              )}
            </CardContent>
          </Card>

          {/* Summary Stats Cards */}
          <div className="space-y-6 lg:col-span-4">
            {/* This Week Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-medium tracking-wide">
                  This Week
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">5</div>
                    <p className="text-sm text-gray-600">Workouts</p>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">
                      4h 15m
                    </div>
                    <p className="text-sm text-gray-600">Duration</p>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-600">
                      12.5k
                    </div>
                    <p className="text-sm text-gray-600">lbs lifted</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Consistency Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="text-lg font-medium tracking-wide">
                    Recent Days
                  </span>
                  <Button variant="ghost" size="sm">
                    <BarChart3 className="h-4 w-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Use a proper bar chart */}
                <div className="flex h-20 items-end justify-between space-x-2">
                  {consistency.data && consistency.data.length > 0
                    ? consistency.data.slice(-7).map((day, index) => {
                        const maxWorkouts = Math.max(
                          ...consistency.data.map((d) => d.workoutsCompleted),
                          1,
                        );
                        return (
                          <div
                            key={index}
                            className="flex flex-1 flex-col items-center"
                          >
                            <div
                              className="w-full rounded-t bg-blue-600"
                              style={{
                                height: `${(day.workoutsCompleted / maxWorkouts) * 100}%`,
                                minHeight: "4px",
                              }}
                            />
                            <span className="mt-1 text-xs text-gray-600">
                              {new Date(day.date)
                                .toLocaleDateString("en-US", {
                                  weekday: "short",
                                })
                                .charAt(0)}
                            </span>
                          </div>
                        );
                      })
                    : Array.from({ length: 7 }, (_, index) => (
                        <div
                          key={index}
                          className="flex flex-1 flex-col items-center"
                        >
                          <div
                            className="w-full rounded-t bg-gray-200"
                            style={{
                              height: "4px",
                            }}
                          />
                          <span className="mt-1 text-xs text-gray-600">
                            {["S", "M", "T", "W", "T", "F", "S"][index]}
                          </span>
                        </div>
                      ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};
