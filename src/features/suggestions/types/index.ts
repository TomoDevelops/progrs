import type {
  GenerateWorkoutRequest,
  GeneratedWorkout,
} from "@/features/suggestions/schemas/ai-workout.schemas";

// Re-export from ai-workouts for compatibility
export type {
  GenerateWorkoutRequest,
  GeneratedWorkout,
} from "@/features/suggestions/schemas/ai-workout.schemas";

export interface SuggestionsPageProps {
  className?: string;
}

export interface SuggestionsState {
  formData: GenerateWorkoutRequest | null;
  generatedWorkout: GeneratedWorkout | null;
}

export interface SuggestionsActions {
  handleGenerate: (data: GenerateWorkoutRequest) => Promise<void>;
  handleRegenerate: () => Promise<void>;
  handleReset: () => void;
}