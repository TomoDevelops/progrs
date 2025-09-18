"use client";

import { useState, useEffect } from "react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/components/ui/popover";
import { Search, Plus } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import {
  ExerciseSearchList,
  type Exercise,
} from "@/features/workout-routines/components/ExerciseSearchList";

type ExerciseSelectorProps = {
  onExerciseSelect: (exercise: Exercise) => void;
  selectedExerciseIds?: string[];
  className?: string;
};

export function ExerciseSelector({
  onExerciseSelect,
  selectedExerciseIds = [],
  className,
}: ExerciseSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchExercises = async (search?: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (search) {
        params.append("search", search);
      }
      params.append("limit", "20");

      const response = await fetch(`/api/exercises?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setExercises(data.data);
        return;
      }

      setError(data.error || "Failed to fetch exercises");
    } catch (err) {
      setError("Failed to fetch exercises");
      console.error("Error fetching exercises:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchExercises(searchQuery);
    }
  }, [isOpen, searchQuery]);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
  };

  const handleExerciseSelect = (exercise: Exercise) => {
    onExerciseSelect(exercise);
    setIsOpen(false);
    setSearchQuery("");
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen} modal={true}>
      <PopoverTrigger className="mt-0" asChild>
        <Button
          variant="outline"
          className={cn("w-full justify-start", className)}
        >
          <Plus className="h-4 w-4" />
          Add Exercise
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[var(--radix-popover-trigger-width)] p-4"
        align="start"
      >
        <div className="relative mb-4">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            placeholder="Search exercises..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="h-80 space-y-2 overflow-auto">
          <ExerciseSearchList
            isLoading={isLoading}
            error={error}
            exercises={exercises}
            selectedExerciseIds={selectedExerciseIds}
            onExerciseSelect={handleExerciseSelect}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
