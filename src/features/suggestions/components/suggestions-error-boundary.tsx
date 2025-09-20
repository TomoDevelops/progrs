"use client";

import React from "react";
import { ErrorBoundary } from "react-error-boundary";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface SuggestionsErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

function SuggestionsErrorFallback({ error, resetErrorBoundary }: SuggestionsErrorFallbackProps) {
  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <AlertTriangle className="h-12 w-12 text-destructive" />
          </div>
          <CardTitle className="text-destructive">Something went wrong</CardTitle>
          <CardDescription>
            An error occurred while loading the workout suggestions page.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="text-sm text-muted-foreground bg-muted p-3 rounded-md text-left">
            <code>{error.message}</code>
          </div>
          <Button onClick={resetErrorBoundary} className="w-full">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

interface SuggestionsErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<SuggestionsErrorFallbackProps>;
}

export function SuggestionsErrorBoundary({ children, fallback }: SuggestionsErrorBoundaryProps) {
  const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
    console.error('Suggestions Error Boundary caught an error:', error, errorInfo);
  };

  return (
    <ErrorBoundary
      FallbackComponent={fallback || SuggestionsErrorFallback}
      onError={handleError}
    >
      {children}
    </ErrorBoundary>
  );
}

// Hook-based error boundary for functional components
export function useSuggestionsErrorHandler() {
  const [error, setError] = React.useState<Error | null>(null);

  const resetError = React.useCallback(() => {
    setError(null);
  }, []);

  const handleError = React.useCallback((error: Error) => {
    console.error('Suggestions error:', error);
    setError(error);
  }, []);

  return { error, resetError, handleError };
}