import { Zap } from "lucide-react";

export function SuggestionsHeader() {
  return (
    <div className="text-center space-y-4">
      <div className="flex items-center justify-center gap-2">
        <Zap className="h-8 w-8 text-primary" />
        <h1 className="text-4xl font-bold">Build Today&apos;s Training</h1>
      </div>
      <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
        Generate a personalized workout based on your goals, equipment, and available time.
        Get a complete routine you can start immediately.
      </p>
    </div>
  );
}