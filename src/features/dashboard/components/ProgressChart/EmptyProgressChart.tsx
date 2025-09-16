"use client";

import { Card, CardContent } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { TrendingUp, Dumbbell } from "lucide-react";

interface EmptyProgressChartProps {
  onSelectExercise: () => void;
}

export function EmptyProgressChart({
  onSelectExercise,
}: EmptyProgressChartProps) {
  return (
    <Card className="flex h-[400px] items-center justify-center">
      <CardContent className="space-y-4 p-8 text-center">
        <div className="flex justify-center">
          <div className="relative">
            <TrendingUp className="h-16 w-16 text-gray-300" />
            <Dumbbell className="absolute -right-1 -bottom-1 h-8 w-8 text-gray-400" />
          </div>
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-gray-700">
            No Progress Data Available
          </h3>
          <p className="mx-auto max-w-sm text-sm text-gray-500">
            Start tracking your progress by selecting an exercise you&apos;ve
            been working on. Your workout history will show up here as beautiful
            charts.
          </p>
        </div>
        <Button onClick={onSelectExercise} className="mt-4">
          <Dumbbell className="mr-2 h-4 w-4" />
          Select Exercise
        </Button>
      </CardContent>
    </Card>
  );
}
