"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  User,
  Settings,
  LogOut,
  Dumbbell,
  Target,
  TrendingUp,
  Plus,
  Play,
  Clock,
  Calendar,
  BarChart3,
} from "lucide-react";
import { useState } from "react";
import type { UseDashboardReturn } from "@/app/(dashboard)/hooks/useDashboard";

interface DashboardContentProps {
  dashboardState: UseDashboardReturn;
}

// Mock data for demonstration
const mockWorkoutHistory = [
  {
    id: 1,
    name: "Push Day - Chest & Triceps",
    emoji: "💪",
    date: "2 hours ago",
    duration: "45 min",
    achievement: "PR: Bench Press 185 lbs",
  },
  {
    id: 2,
    name: "Leg Day - Squats & Deadlifts",
    emoji: "🦵",
    date: "Yesterday",
    duration: "52 min",
    achievement: "15,000 lbs total volume",
  },
  {
    id: 3,
    name: "Pull Day - Back & Biceps",
    emoji: "🏋️",
    date: "2 days ago",
    duration: "38 min",
    achievement: "PR: Pull-ups 12 reps",
  },
];

const mockWeeklyData = [3, 2, 4, 1, 3, 2, 1]; // Workouts per day this week

// Mock trending metrics data
const mockMetricsData = {
  weight: [
    { date: "Jan 1", value: 135 },
    { date: "Jan 8", value: 140 },
    { date: "Jan 15", value: 145 },
    { date: "Jan 22", value: 150 },
    { date: "Jan 29", value: 155 },
    { date: "Feb 5", value: 160 },
    { date: "Feb 12", value: 165 },
  ],
  reps: [
    { date: "Jan 1", value: 8 },
    { date: "Jan 8", value: 10 },
    { date: "Jan 15", value: 12 },
    { date: "Jan 22", value: 10 },
    { date: "Jan 29", value: 15 },
    { date: "Feb 5", value: 12 },
    { date: "Feb 12", value: 18 },
  ],
  duration: [
    { date: "Jan 1", value: 30 },
    { date: "Jan 8", value: 35 },
    { date: "Jan 15", value: 45 },
    { date: "Jan 22", value: 40 },
    { date: "Jan 29", value: 50 },
    { date: "Feb 5", value: 55 },
    { date: "Feb 12", value: 60 },
  ],
};

export const DashboardContent = ({ dashboardState }: DashboardContentProps) => {
  const { user, isLoading, handleSignOut } = dashboardState;
  const [selectedMetric, setSelectedMetric] = useState<
    "weight" | "reps" | "duration"
  >("weight");

  const getMetricData = () => mockMetricsData[selectedMetric];
  const getMetricMax = () =>
    Math.max(...getMetricData().map((d) => d.value)) * 1.1;

  const getMetricPath = (isArea: boolean) => {
    const data = getMetricData();
    const max = getMetricMax();
    const points = data.map((point, index) => {
      const x = (index / (data.length - 1)) * 100;
      const y = 100 - (point.value / max) * 100;
      return `${x},${y}`;
    });

    if (isArea) {
      return `M 0,100 L ${points.join(" L ")} L 100,100 Z`;
    }
    return `M ${points.join(" L ")}`;
  };

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

  const dailyGoalProgress = 75; // Mock progress percentage
  const todaysWorkout = {
    name: "Push Day - Chest & Triceps",
    duration: "45-60 min",
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="border-b bg-white/80 shadow-sm backdrop-blur-sm">
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
              <Button variant="ghost" size="sm">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Button>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Good {greeting}, {user.name || user.username}! 👋
          </h1>
          <p className="mt-2 text-gray-600">{currentDate}</p>
        </div>

        {/* Top Row - Today's Workout, Quick Start, Daily Goal */}
        <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Today's Planned Workout Card */}
          <Card className="border-0 bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg lg:col-span-5">
            <CardHeader>
              <CardTitle className="text-white">Today&apos;s Workout</CardTitle>
              <CardDescription className="text-blue-100">
                {todaysWorkout.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="mb-2 text-sm text-blue-100">
                    <Clock className="mr-1 inline h-4 w-4" />
                    {todaysWorkout.duration}
                  </p>
                  <Button className="bg-white text-blue-600 hover:bg-blue-50">
                    <Play className="mr-2 h-4 w-4" />
                    Start Workout
                  </Button>
                </div>
                <div className="text-6xl opacity-20">💪</div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Start Button */}
          <div className="flex items-center justify-center lg:col-span-2">
            <Button
              size="lg"
              className="h-20 w-20 rounded-full bg-gradient-to-r from-orange-500 to-red-500 shadow-lg hover:from-orange-600 hover:to-red-600"
            >
              <Plus className="h-8 w-8" />
            </Button>
            <div className="ml-4 lg:hidden">
              <p className="font-medium">Quick Start</p>
              <p className="text-sm text-gray-600">Empty Workout</p>
            </div>
          </div>

          {/* Daily Goal Progress */}
          <Card className="lg:col-span-5">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="mr-2 h-5 w-5" />
                Daily Goal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold">{dailyGoalProgress}%</div>
                  <p className="text-sm text-gray-600">Workout completed</p>
                </div>
                <div className="relative h-16 w-16">
                  <svg
                    className="h-16 w-16 -rotate-90 transform"
                    viewBox="0 0 36 36"
                  >
                    <path
                      className="text-gray-200"
                      stroke="currentColor"
                      strokeWidth="3"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="text-blue-600"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeDasharray={`${dailyGoalProgress}, 100`}
                      strokeLinecap="round"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Middle Row - Workout History, Stats, and Trending Metrics */}
        <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Workout History Feed */}
          <Card className="lg:col-span-4">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Recent Workouts</span>
                <Button variant="ghost" size="sm">
                  View All
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {mockWorkoutHistory.map((workout) => (
                <div
                  key={workout.id}
                  className="flex items-center space-x-4 rounded-lg bg-gray-50 p-3"
                >
                  <div className="text-2xl">{workout.emoji}</div>
                  <div className="flex-1">
                    <h4 className="font-medium">{workout.name}</h4>
                    <p className="text-sm text-gray-600">
                      {workout.date} • {workout.duration}
                    </p>
                    <p className="text-sm font-medium text-blue-600">
                      {workout.achievement}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Summary Stats Cards */}
          <div className="space-y-6 lg:col-span-4">
            {/* This Week Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">This Week</CardTitle>
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
                  <span>This Week</span>
                  <Button variant="ghost" size="sm">
                    <BarChart3 className="h-4 w-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex h-20 items-end justify-between space-x-2">
                  {mockWeeklyData.map((count, index) => (
                    <div
                      key={index}
                      className="flex flex-1 flex-col items-center"
                    >
                      <div
                        className="w-full rounded-t bg-blue-600"
                        style={{
                          height: `${(count / 4) * 100}%`,
                          minHeight: "4px",
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

          {/* Trending Metrics */}
          <Card className="border-0 shadow-lg lg:col-span-4">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle>Trending Metrics</CardTitle>
                <CardDescription>Track your progress over time</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={selectedMetric === "weight" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedMetric("weight")}
                >
                  Weight
                </Button>
                <Button
                  variant={selectedMetric === "reps" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedMetric("reps")}
                >
                  Reps
                </Button>
                <Button
                  variant={
                    selectedMetric === "duration" ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() => setSelectedMetric("duration")}
                >
                  Duration
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="relative h-64">
                <div className="absolute inset-0 flex flex-col">
                  <div className="relative flex-1">
                    {/* Y-axis labels */}
                    <div className="text-muted-foreground absolute top-0 left-0 flex h-full flex-col justify-between py-2 text-xs">
                      <span>{getMetricMax()}</span>
                      <span>{Math.round(getMetricMax() * 0.75)}</span>
                      <span>{Math.round(getMetricMax() * 0.5)}</span>
                      <span>{Math.round(getMetricMax() * 0.25)}</span>
                      <span>0</span>
                    </div>

                    {/* Graph area */}
                    <div className="relative mr-4 ml-8 h-full">
                      {/* Grid lines */}
                      <div className="absolute inset-0">
                        {[0, 25, 50, 75, 100].map((percent) => (
                          <div
                            key={percent}
                            className="border-muted/30 absolute w-full border-t"
                            style={{ top: `${100 - percent}%` }}
                          />
                        ))}
                      </div>

                      {/* Data points and line */}
                      <svg className="absolute inset-0 h-full w-full">
                        <defs>
                          <linearGradient
                            id="metricGradient"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="0%"
                              stopColor="hsl(var(--primary))"
                              stopOpacity="0.3"
                            />
                            <stop
                              offset="100%"
                              stopColor="hsl(var(--primary))"
                              stopOpacity="0"
                            />
                          </linearGradient>
                        </defs>

                        {/* Area under curve */}
                        <path
                          d={getMetricPath(true)}
                          fill="url(#metricGradient)"
                          className="opacity-50"
                        />

                        {/* Main line */}
                        <path
                          d={getMetricPath(false)}
                          fill="none"
                          stroke="hsl(var(--primary))"
                          strokeWidth="2"
                          className="drop-shadow-sm"
                        />

                        {/* Data points */}
                        {getMetricData().map((point, index) => {
                          const x =
                            (index / (getMetricData().length - 1)) * 100;
                          const y = 100 - (point.value / getMetricMax()) * 100;
                          return (
                            <circle
                              key={index}
                              cx={`${x}%`}
                              cy={`${y}%`}
                              r="4"
                              fill="hsl(var(--primary))"
                              className="hover:r-6 cursor-pointer drop-shadow-sm transition-all"
                            />
                          );
                        })}
                      </svg>
                    </div>
                  </div>

                  {/* X-axis labels */}
                  <div className="text-muted-foreground mr-4 ml-8 flex justify-between pt-2 text-xs">
                    {getMetricData().map((point, index) => (
                      <span key={index}>{point.date}</span>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Account Status */}
        {!user.emailVerified && (
          <div className="mb-6">
            <Card className="border-orange-200 bg-orange-50">
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
      </main>
    </div>
  );
};
