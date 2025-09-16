"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { TrendingUp, TrendingDown, Minus, Calendar } from "lucide-react";

export interface WeeklyStats {
  workouts: number;
  duration: number; // in minutes
  volume: number; // in kg
}

interface ThisWeekCardProps {
  currentWeek: WeeklyStats;
  lastWeek?: WeeklyStats;
}

export function ThisWeekCard({ currentWeek, lastWeek }: ThisWeekCardProps) {
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const formatVolume = (kg: number) => {
    if (kg >= 1000) {
      return `${(kg / 1000).toFixed(1)}k`;
    }
    return kg.toString();
  };

  const calculateDelta = (current: number, previous?: number) => {
    if (!previous || previous === 0) return null;
    const delta = ((current - previous) / previous) * 100;
    return Math.round(delta);
  };

  const getDeltaDisplay = (delta: number | null) => {
    if (delta === null) return null;
    
    const isPositive = delta > 0;
    const isNeutral = delta === 0;
    
    return {
      value: Math.abs(delta),
      isPositive,
      isNeutral,
      icon: isNeutral ? Minus : isPositive ? TrendingUp : TrendingDown,
      color: isNeutral ? "text-gray-500" : isPositive ? "text-green-600" : "text-red-600",
      bgColor: isNeutral ? "bg-gray-100" : isPositive ? "bg-green-100" : "bg-red-100",
    };
  };

  const workoutsDelta = calculateDelta(currentWeek.workouts, lastWeek?.workouts);
  const durationDelta = calculateDelta(currentWeek.duration, lastWeek?.duration);
  const volumeDelta = calculateDelta(currentWeek.volume, lastWeek?.volume);

  const workoutsDeltaDisplay = getDeltaDisplay(workoutsDelta);
  const durationDeltaDisplay = getDeltaDisplay(durationDelta);
  const volumeDeltaDisplay = getDeltaDisplay(volumeDelta);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          This Week
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-6">
          {/* Workouts */}
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {currentWeek.workouts}
              </div>
              <p className="text-sm text-muted-foreground">Workouts</p>
            </div>
            {workoutsDeltaDisplay && (
              <Badge 
                variant="secondary" 
                className={`${workoutsDeltaDisplay.bgColor} ${workoutsDeltaDisplay.color} border-0`}
              >
                <workoutsDeltaDisplay.icon className="h-3 w-3 mr-1" />
                {workoutsDeltaDisplay.value}%
              </Badge>
            )}
          </div>

          {/* Duration */}
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-green-600">
                {formatDuration(currentWeek.duration)}
              </div>
              <p className="text-sm text-muted-foreground">Duration</p>
            </div>
            {durationDeltaDisplay && (
              <Badge 
                variant="secondary" 
                className={`${durationDeltaDisplay.bgColor} ${durationDeltaDisplay.color} border-0`}
              >
                <durationDeltaDisplay.icon className="h-3 w-3 mr-1" />
                {durationDeltaDisplay.value}%
              </Badge>
            )}
          </div>

          {/* Volume */}
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {formatVolume(currentWeek.volume)}
                <span className="text-sm font-normal text-muted-foreground ml-1">kg</span>
              </div>
              <p className="text-sm text-muted-foreground">Volume lifted</p>
            </div>
            {volumeDeltaDisplay && (
              <Badge 
                variant="secondary" 
                className={`${volumeDeltaDisplay.bgColor} ${volumeDeltaDisplay.color} border-0`}
              >
                <volumeDeltaDisplay.icon className="h-3 w-3 mr-1" />
                {volumeDeltaDisplay.value}%
              </Badge>
            )}
          </div>
        </div>

        {/* Last week comparison note */}
        {lastWeek && (
          <div className="mt-6 pt-4 border-t border-gray-100">
            <p className="text-xs text-muted-foreground text-center">
              Compared to last week
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}