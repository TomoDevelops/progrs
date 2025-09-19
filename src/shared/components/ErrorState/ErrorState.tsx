"use client";

import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";

export interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
  fullScreen?: boolean;
  variant?: "default" | "destructive";
}

export function ErrorState({
  title = "Error",
  message,
  onRetry,
  retryLabel = "Try again",
  className,
  fullScreen = false,
  variant = "destructive",
}: ErrorStateProps) {
  const titleColor = variant === "destructive" ? "text-red-600" : "text-foreground";
  const iconColor = variant === "destructive" ? "text-red-500" : "text-muted-foreground";

  const content = (
    <div className={cn("text-center", className)}>
      <div className="flex justify-center mb-4">
        <AlertCircle className={cn("h-12 w-12", iconColor)} />
      </div>
      <h1 className={cn("mb-2 text-2xl font-bold", titleColor)}>{title}</h1>
      <p className="text-muted-foreground mb-4">{message}</p>
      {onRetry && (
        <Button
          onClick={onRetry}
          variant={variant === "destructive" ? "destructive" : "default"}
          className="inline-flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          {retryLabel}
        </Button>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        {content}
      </div>
    );
  }

  return content;
}