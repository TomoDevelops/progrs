"use client";

import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { Separator } from "@/shared/components/ui/separator";
import { Search, Loader2 } from "lucide-react";
import {
  useFavoriteExercises,
  useAllExercises,
} from "@/features/dashboard/hooks/useProgressData";
import { useDebounce } from "@/shared/hooks/useDebounce";

interface ExerciseSelectorProps {
  selectedExerciseId?: string;
  selectedExerciseName?: string | null;
  onExerciseChange: (exerciseId: string) => void;
}

export const ExerciseSelector = ({
  selectedExerciseId,
  selectedExerciseName,
  onExerciseChange,
}: ExerciseSelectorProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [offset, setOffset] = useState(0);
  const debouncedSearch = useDebounce(searchTerm, 300);

  const { data: favorites, isLoading: favoritesLoading } =
    useFavoriteExercises();
  const { data: allExercises, isLoading: allExercisesLoading } =
    useAllExercises(debouncedSearch || undefined, offset, 20);

  const handleExerciseSelect = (exerciseId: string) => {
    onExerciseChange(exerciseId);
    setIsModalOpen(false);
    setSearchTerm("");
    setOffset(0);
  };

  const loadMore = () => {
    if (allExercises?.hasMore) {
      setOffset((prev) => prev + 20);
    }
  };

  return (
    <>
      <Select
        value={selectedExerciseId || ""}
        onValueChange={(value) => {
          if (value === "view-all") {
            setIsModalOpen(true);
            return;
          }
          
          onExerciseChange(value);
        }}
      >
        <SelectTrigger className="w-full sm:w-[250px]">
          <SelectValue placeholder="Select exercise...">
            {selectedExerciseName || "Select exercise..."}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {favoritesLoading ? (
            <SelectItem value="loading" disabled>
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading favorites...
              </div>
            </SelectItem>
          ) : (
            <>
              {favorites?.exercises.map((exercise) => (
                <SelectItem key={exercise.id} value={exercise.id}>
                  <div className="flex flex-col">
                    <span className="font-medium">{exercise.name}</span>
                    {exercise.muscleGroup && (
                      <span className="text-muted-foreground text-xs">
                        {exercise.muscleGroup}
                      </span>
                    )}
                  </div>
                </SelectItem>
              ))}
              {favorites?.exercises.length === 0 && (
                <SelectItem value="no-favorites" disabled>
                  No favorite exercises yet
                </SelectItem>
              )}
              <Separator className="my-1" />
              <SelectItem value="view-all">
                <span className="text-primary font-medium">
                  View all exercises...
                </span>
              </SelectItem>
            </>
          )}
        </SelectContent>
      </Select>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Select Exercise</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="relative">
              <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              <Input
                placeholder="Search exercises..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setOffset(0);
                }}
                className="pl-10"
              />
            </div>

            <div className="max-h-64 space-y-1 overflow-y-auto">
              {allExercisesLoading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-muted-foreground ml-2 text-sm">
                    Loading...
                  </span>
                </div>
              ) : (
                <>
                  {allExercises?.exercises.map((exercise) => (
                    <Button
                      key={exercise.id}
                      variant="ghost"
                      className="h-auto w-full justify-start p-3"
                      onClick={() => handleExerciseSelect(exercise.id)}
                    >
                      <div className="flex flex-col items-start">
                        <span className="font-medium">{exercise.name}</span>
                        {exercise.muscleGroup && (
                          <span className="text-muted-foreground text-xs">
                            {exercise.muscleGroup}
                          </span>
                        )}
                      </div>
                    </Button>
                  ))}

                  {allExercises?.exercises.length === 0 && (
                    <div className="text-muted-foreground py-4 text-center text-sm">
                      {searchTerm
                        ? "No exercises found"
                        : "No exercises available"}
                    </div>
                  )}

                  {allExercises?.hasMore && (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={loadMore}
                      disabled={allExercisesLoading}
                    >
                      {allExercisesLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Load more"
                      )}
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
