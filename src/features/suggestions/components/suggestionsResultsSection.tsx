import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Loader2, Dumbbell } from "lucide-react";
import { WorkoutResults } from "@/features/suggestions/components/workoutResults";
import type { GeneratedWorkout } from "../types";

interface SuggestionsResultsSectionProps {
  generatedWorkout: GeneratedWorkout | null;
  isLoading: boolean;
  error: string | null;
  onRegenerate: () => Promise<void>;
  onReset: () => void;
}

export function SuggestionsResultsSection({
  generatedWorkout,
  isLoading,
  error,
  onRegenerate,
  onReset,
}: SuggestionsResultsSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Generated Workout</CardTitle>
        <CardDescription>
          Your personalized training routine is ready to go.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin mx-auto" />
              <p className="text-muted-foreground">Generating your workout...</p>
            </div>
          </div>
        )}
        
        {error && (
          <div className="text-center py-12 space-y-4">
            <div className="text-destructive text-sm bg-destructive/10 p-4 rounded-lg">
              {error}
            </div>
            <Button onClick={onRegenerate} variant="outline">
              Try Again
            </Button>
          </div>
        )}
        
        {!isLoading && !error && !generatedWorkout && (
          <div className="text-center py-12 text-muted-foreground">
            <Dumbbell className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Fill out the form to generate your workout</p>
          </div>
        )}
        
        {generatedWorkout && (
          <WorkoutResults 
            workout={generatedWorkout}
            onRegenerate={onRegenerate}
            onReset={onReset}
            isRegenerating={isLoading}
          />
        )}
      </CardContent>
    </Card>
  );
}
