"use client";

import { SuggestionsHeader } from "./suggestions-header";
import { SuggestionsStats } from "./suggestions-stats";
import { SuggestionsFormSection } from "./suggestions-form-section";
import { SuggestionsResultsSection } from "./suggestions-results-section";
import { SuggestionsErrorBoundary } from "./suggestions-error-boundary";
import { useSuggestionsState } from "../hooks/use-suggestions-state";
import type { SuggestionsPageProps } from "../types";
import { cn } from "@/shared/lib/utils";

export function SuggestionsPage({ className }: SuggestionsPageProps) {
  const {
    formData,
    generatedWorkout,
    handleGenerate,
    handleRegenerate,
    handleReset,
    isLoading,
    error,
  } = useSuggestionsState();

  return (
    <SuggestionsErrorBoundary>
      <div className={cn("container mx-auto py-8 space-y-8", className)}>
        <SuggestionsHeader />
        
        <SuggestionsStats />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <SuggestionsFormSection
            onSubmit={handleGenerate}
            onReset={handleReset}
            isLoading={isLoading}
            initialData={formData}
          />

          <SuggestionsResultsSection
            generatedWorkout={generatedWorkout}
            isLoading={isLoading}
            error={error}
            onRegenerate={handleRegenerate}
            onReset={handleReset}
          />
        </div>
      </div>
    </SuggestionsErrorBoundary>
  );
}