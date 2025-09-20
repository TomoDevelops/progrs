import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { WorkoutForm } from "@/features/suggestions/components/workoutForm";
import type { GenerateWorkoutRequest } from "../types";

interface SuggestionsFormSectionProps {
  onSubmit: (data: GenerateWorkoutRequest) => Promise<void>;
  onReset: () => void;
  isLoading: boolean;
  initialData: GenerateWorkoutRequest | null;
}

export function SuggestionsFormSection({
  onSubmit,
  onReset,
  isLoading,
  initialData,
}: SuggestionsFormSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Workout Preferences</CardTitle>
        <CardDescription>
          Tell us about your goals and available equipment to generate your perfect workout.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <WorkoutForm 
          onSubmit={onSubmit}
          onReset={onReset}
          isLoading={isLoading}
          initialData={initialData}
        />
      </CardContent>
    </Card>
  );
}
