"use client";

import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

interface DashboardErrorFallbackProps {
  error?: Error;
  resetError: () => void;
  title?: string;
  queryKey?: string[];
}

export const DashboardErrorFallback: React.FC<DashboardErrorFallbackProps> = ({
  error,
  resetError,
  title = "Failed to load data",
  queryKey,
}) => {
  const queryClient = useQueryClient();

  const handleRetry = () => {
    if (queryKey) {
      queryClient.invalidateQueries({ queryKey });
    }
    resetError();
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-red-600">
          <AlertTriangle className="h-5 w-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center space-y-4 py-8">
        <p className="text-center text-sm text-gray-600">
          {error?.message || "Something went wrong while loading this section"}
        </p>
        <Button
          onClick={handleRetry}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Try again
        </Button>
      </CardContent>
    </Card>
  );
};
