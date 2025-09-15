"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Textarea } from "@/shared/components/ui/textarea";
import { Label } from "@/shared/components/ui/label";
import { Trophy, Clock, Target, Loader2 } from "lucide-react";
import type { FinishSessionData } from "../../types";

interface FinishWorkoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (data: FinishSessionData) => Promise<void>;
  isFinishing: boolean;
  completedExercises: number;
  totalExercises: number;
  duration: number;
}

export function FinishWorkoutDialog({
  open,
  onOpenChange,
  onConfirm,
  isFinishing,
  completedExercises,
  totalExercises,
  duration,
}: FinishWorkoutDialogProps) {
  const [notes, setNotes] = useState("");

  const handleConfirm = async () => {
    await onConfirm({ notes: notes.trim() || undefined });
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const completionRate = Math.round((completedExercises / totalExercises) * 100);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Finish Workout
          </DialogTitle>
          <DialogDescription>
            Great job! You&apos;re about to complete your workout session.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Workout Summary */}
          <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <Target className="h-4 w-4 text-blue-500" />
              </div>
              <div className="text-lg font-bold text-blue-600">{completedExercises}</div>
              <div className="text-xs text-muted-foreground">Exercises</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <Clock className="h-4 w-4 text-green-500" />
              </div>
              <div className="text-lg font-bold text-green-600">{formatDuration(duration)}</div>
              <div className="text-xs text-muted-foreground">Duration</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <Trophy className="h-4 w-4 text-yellow-500" />
              </div>
              <div className="text-lg font-bold text-yellow-600">{completionRate}%</div>
              <div className="text-xs text-muted-foreground">Complete</div>
            </div>
          </div>

          {/* Completion Status */}
          {completedExercises < totalExercises && (
            <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <p className="text-sm text-orange-800">
                You have {totalExercises - completedExercises} exercise(s) remaining. 
                Are you sure you want to finish early?
              </p>
            </div>
          )}

          {/* Notes Section */}
          <div className="space-y-2">
            <Label htmlFor="notes">Workout Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="How did the workout feel? Any observations or achievements?"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isFinishing}
          >
            Continue Workout
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isFinishing}
            className="bg-green-600 hover:bg-green-700"
          >
            {isFinishing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Finishing...
              </>
            ) : (
              <>
                <Trophy className="h-4 w-4 mr-2" />
                Finish Workout
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}