import { Card, CardContent } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Dumbbell, Plus } from "lucide-react";

interface WorkoutHistoryEmptyProps {
  onCreateWorkout?: () => void;
}

export const WorkoutHistoryEmpty = ({ onCreateWorkout }: WorkoutHistoryEmptyProps) => {
  return (
    <Card className="border-dashed border-2 border-gray-200">
      <CardContent className="flex flex-col items-center justify-center py-12">
        <div className="rounded-full bg-gray-100 p-4 mb-4">
          <Dumbbell className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          No workout history yet
        </h3>
        <p className="text-sm text-gray-600 text-center mb-6 max-w-sm">
          Start your fitness journey by completing your first workout. Your progress will appear here.
        </p>
        {onCreateWorkout && (
          <Button onClick={onCreateWorkout} className="gap-2">
            <Plus className="h-4 w-4" />
            Create your first routine
          </Button>
        )}
      </CardContent>
    </Card>
  );
};