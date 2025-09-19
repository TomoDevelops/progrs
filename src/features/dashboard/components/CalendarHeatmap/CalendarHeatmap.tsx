"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";

import { cn } from "@/shared/lib/utils";
import type { ConsistencyData } from "@/app/api/dashboard/repository/dashboard.repository";

interface CalendarHeatmapProps {
  data: ConsistencyData[];
  className?: string;
}

export function CalendarHeatmap({ data, className }: CalendarHeatmapProps) {
  const userLocale =
    typeof navigator !== "undefined" ? navigator.language : "en-US";

  // Generate 3 months (approximately 13 weeks) of data
  const generateHeatmapData = () => {
    const today = new Date();
    const dataMap = new Map(
      data.map((item) => [item.date, item.workoutsCompleted]),
    );

    // Calculate start date (3 months ago, aligned to start of week)
    const startDate = new Date(today);
    startDate.setMonth(today.getMonth() - 3);

    // Find the Monday of the week containing the start date
    const dayOfWeek = startDate.getDay();
    const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Sunday = 0, so offset is 6
    startDate.setDate(startDate.getDate() - mondayOffset);

    // Generate weeks array
    const weeks = [];
    const currentDate = new Date(startDate);

    while (currentDate <= today) {
      const week = [];

      // Generate 7 days for this week (Mon-Sun)
      for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
        const date = new Date(currentDate);
        date.setDate(currentDate.getDate() + dayIndex);

        const dateStr = date.toISOString().split("T")[0];
        const workouts = dataMap.get(dateStr) || 0;

        week.push({
          date: dateStr,
          dateObj: new Date(date),
          workouts,
          isToday: date.toDateString() === today.toDateString(),
          dayOfWeek: dayIndex, // 0 = Monday, 6 = Sunday
        });
      }

      weeks.push(week);
      currentDate.setDate(currentDate.getDate() + 7);
    }

    return weeks;
  };

  const weeks = generateHeatmapData();
  const allDays = weeks.flat();
  const maxWorkouts = Math.max(...allDays.map((d) => d.workouts), 1);

  // Get intensity level (0-4) based on workout count
  const getIntensityLevel = (workouts: number) => {
    if (workouts === 0) return 0;
    const ratio = workouts / maxWorkouts;
    if (ratio <= 0.25) return 1;
    if (ratio <= 0.5) return 2;
    if (ratio <= 0.75) return 3;
    return 4;
  };

  const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const intensityColors = {
    0: "bg-gray-100 hover:bg-gray-200", // No activity
    1: "bg-green-100 hover:bg-green-200", // Low activity
    2: "bg-green-300 hover:bg-green-400", // Medium activity
    3: "bg-green-500 hover:bg-green-600", // High activity
    4: "bg-green-700 hover:bg-green-800", // Very high activity
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="text-lg font-medium tracking-wide">
            Activity Heatmap
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="p-4 pb-0">
          {/* Header */}
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-muted-foreground text-sm font-medium">
              Activity
            </h3>
            <div className="text-muted-foreground text-xs">
              Total: {allDays.reduce((sum, day) => sum + day.workouts, 0)}{" "}
              workouts
            </div>
          </div>
        </div>

        {/* Heatmap Grid - Full width */}
        <div className="px-4">
          <div className="flex flex-col gap-1">
            {/* Month labels */}
            <div className="text-muted-foreground mb-1 flex gap-1 text-xs">
              <div className="w-6" /> {/* Spacer for day labels */}
              {weeks.map((week, weekIndex) => {
                const firstDay = week[0];
                if (!firstDay)
                  return <div key={weekIndex} className="min-w-0 flex-1" />;

                const weekStart = firstDay.dateObj;
                const isFirstOfMonth = weekStart.getDate() <= 7;

                return (
                  <div key={weekIndex} className="min-w-0 flex-1 text-center">
                    {isFirstOfMonth
                      ? weekStart.toLocaleDateString(userLocale, {
                          month: "short",
                        })
                      : ""}
                  </div>
                );
              })}
            </div>

            {/* Days grid - each row is a day of week */}
            {dayLabels.map((dayName, dayIndex) => (
              <div key={dayName} className="flex items-center gap-1">
                {/* Day label */}
                <div className="text-muted-foreground w-6 text-right text-xs">
                  {dayIndex % 2 === 0 ? dayName : ""}
                </div>

                {/* Week squares for this day */}
                {weeks.map((week, weekIndex) => {
                  const day = week[dayIndex]; // dayIndex corresponds to dayOfWeek (0=Mon, 6=Sun)

                  if (!day) {
                    return (
                      <div
                        key={`${weekIndex}-${dayIndex}`}
                        className="bg-muted/30 aspect-square min-w-0 flex-1 rounded-sm"
                      />
                    );
                  }

                  const intensity = getIntensityLevel(day.workouts);
                  const isToday = day.isToday;

                  return (
                    <div
                      key={`${weekIndex}-${dayIndex}`}
                      className={cn(
                        "aspect-square min-w-0 flex-1 cursor-pointer rounded-sm transition-all duration-200 hover:scale-110",
                        intensityColors[
                          intensity as keyof typeof intensityColors
                        ],
                        isToday && "ring-primary ring-2 ring-offset-1",
                      )}
                      title={`${day.workouts} workout${day.workouts !== 1 ? "s" : ""} on ${day.dateObj.toLocaleDateString(
                        userLocale,
                        {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        },
                      )}`}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-between p-4 pt-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Less</span>
            {[0, 1, 2, 3, 4].map((level) => (
              <div
                key={level}
                className={cn(
                  "h-4 w-4 rounded-sm border border-gray-200",
                  intensityColors[level as keyof typeof intensityColors],
                )}
              />
            ))}
            <span className="text-muted-foreground">More</span>
          </div>

          <div className="text-muted-foreground text-xs">
            {allDays.reduce((sum: number, day) => sum + day.workouts, 0)}{" "}
            workouts in 3 months
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
