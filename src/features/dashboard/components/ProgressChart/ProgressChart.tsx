"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { format, parseISO } from "date-fns";
import { useProgressData } from "@/features/dashboard/hooks/useProgressData";
import { ExerciseSelector } from "./ExerciseSelector";
import { ProgressChartSkeleton } from "./ProgressChartSkeleton";
import { EmptyProgressChart } from "./EmptyProgressChart";

const TIMEFRAME_OPTIONS = [
  { value: "4W", label: "4W" },
  { value: "8W", label: "8W" },
  { value: "3M", label: "3M" },
  { value: "1Y", label: "1Y" },
  { value: "ALL", label: "ALL" },
] as const;

const METRIC_LABELS = {
  weight: "Weight (kg)",
  reps: "Reps",
  volume: "Volume (kg)",
} as const;

export const ProgressChart = () => {
  const [selectedExerciseId, setSelectedExerciseId] = useState<
    string | undefined
  >();
  const [timeframe, setTimeframe] = useState<"4W" | "8W" | "3M" | "1Y" | "ALL">(
    "8W",
  );
  const [metric] = useState<"weight" | "reps" | "volume">("weight"); // Start with weight only

  const {
    data: progressData,
    isLoading,
    error,
  } = useProgressData(selectedExerciseId, timeframe, metric);

  const formatXAxisDate = (dateStr: string) => {
    const date = parseISO(dateStr);
    switch (timeframe) {
      case "4W":
      case "8W":
        return format(date, "MMM d");
      case "3M":
        return format(date, "MMM d");
      case "1Y":
        return format(date, "MMM yyyy");
      case "ALL":
        return format(date, "MMM yyyy");
      default:
        return format(date, "MMM d");
    }
  };

  const formatTooltipDate = (dateStr: string) => {
    const date = parseISO(dateStr);
    return format(date, "PPP"); // Full date format
  };

  const CustomTooltip = ({
    active,
    payload,
    label,
  }: {
    active?: boolean;
    payload?: Array<{
      value: number;
      dataKey: string;
      color: string;
    }>;
    label?: string;
  }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-background rounded-lg border p-3 shadow-md">
          <p className="font-medium">{progressData?.exerciseName}</p>
          <p className="text-muted-foreground text-sm">
            {label ? formatTooltipDate(label) : "No date"}
          </p>
          <p className="text-sm">
            <span className="font-medium" style={{ color: data.color }}>
              {METRIC_LABELS[metric]}: {data.value}
            </span>
          </p>
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
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
          <ProgressChartSkeleton />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-0 text-black lg:col-span-7">
        <CardHeader>
          <CardTitle className="text-lg font-medium tracking-wide">
            Your Progress
          </CardTitle>
          <CardDescription className="text-red-600">
            Failed to load progress data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground flex h-64 items-center justify-center">
            <p>Unable to load chart data. Please try again later.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const hasData = progressData?.data && progressData.data.length > 0;

  return (
    <Card className="border-0 text-black lg:col-span-7">
      <CardHeader>
        <CardTitle className="text-lg font-medium tracking-wide">
          Your Progress
        </CardTitle>
        <CardDescription className="text-green-600">
          {hasData
            ? "Keep up the great work!"
            : "Start tracking your progress!"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Controls */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <ExerciseSelector
            selectedExerciseId={selectedExerciseId}
            selectedExerciseName={progressData?.exerciseName}
            onExerciseChange={setSelectedExerciseId}
          />

          <Select
            value={timeframe}
            onValueChange={(value: "4W" | "8W" | "3M" | "1Y" | "ALL") =>
              setTimeframe(value)
            }
          >
            <SelectTrigger className="w-full sm:w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TIMEFRAME_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Chart */}
        {hasData ? (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={progressData.data}
                margin={{
                  top: 5,
                  right: 0,
                  left: 0,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis
                  dataKey="date"
                  tickFormatter={formatXAxisDate}
                  className="text-xs"
                />
                <YAxis className="text-xs" width={25} />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#22c55e"
                  strokeWidth={2}
                  dot={{ fill: "#22c55e", strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: "#22c55e", strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <EmptyProgressChart onSelectExercise={() => {}} />
        )}
      </CardContent>
    </Card>
  );
};
