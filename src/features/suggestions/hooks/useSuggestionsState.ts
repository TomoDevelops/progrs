import { useState } from "react";
import { useWorkoutGeneration } from "@/features/suggestions/hooks/useWorkoutGeneration";
import type {
  GenerateWorkoutRequest,
  GeneratedWorkout,
  SuggestionsState,
  SuggestionsActions,
} from "../types";

export function useSuggestionsState(): SuggestionsState & SuggestionsActions & {
  isLoading: boolean;
  error: string | null;
} {
  const [formData, setFormData] = useState<GenerateWorkoutRequest | null>(null);
  const [generatedWorkout, setGeneratedWorkout] = useState<GeneratedWorkout | null>(null);
  
  const { generateWorkout, isLoading, error } = useWorkoutGeneration();

  const handleGenerate = async (data: GenerateWorkoutRequest) => {
    setFormData(data);
    try {
      const result = await generateWorkout(data);
      setGeneratedWorkout(result);
    } catch (err) {
      console.error('Failed to generate workout:', err);
    }
  };

  const handleRegenerate = async () => {
    if (formData) {
      try {
        const result = await generateWorkout(formData);
        setGeneratedWorkout(result);
      } catch (err) {
        console.error('Failed to regenerate workout:', err);
      }
    }
  };

  const handleReset = () => {
    setFormData(null);
    setGeneratedWorkout(null);
  };

  return {
    formData,
    generatedWorkout,
    handleGenerate,
    handleRegenerate,
    handleReset,
    isLoading,
    error,
  };
}