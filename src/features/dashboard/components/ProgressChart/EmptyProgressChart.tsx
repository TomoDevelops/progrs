"use client";

import { Card, CardContent } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { TrendingUp, Dumbbell } from "lucide-react";

interface EmptyProgressChartProps {
  onSelectExercise: () => void;
}

export function EmptyProgressChart({ onSelectExercise }: EmptyProgressChartProps) {
  return (
    <Card className="h-[400px] flex items-center justify-center">
      <CardContent className="text-center space-y-4 p-8">
        <div className="flex justify-center">
          <div className="relative">
            <TrendingUp className="h-16 w-16 text-gray-300" />
            <Dumbbell className="h-8 w-8 text-gray-400 absolute -bottom-1 -right-1" />
          </div>
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-gray-700">
            No Progress Data Available
          </h3>
          <p className="text-sm text-gray-500 max-w-sm mx-auto">
            Start tracking your progress by selecting an exercise you&apos;ve been working on.
            Your workout history will show up here as beautiful charts.
          </p>
        </div>
        <Button onClick={onSelectExercise} className="mt-4">
          <Dumbbell className="h-4 w-4 mr-2" />
          Select Exercise
        </Button>
      </CardContent>
    </Card>
  );
}