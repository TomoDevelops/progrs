"use client";

import { Loader2 } from "lucide-react";
import { cn } from "@/shared/lib/utils";

export interface LoadingStateProps {
  message?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  fullScreen?: boolean;
}

const sizeClasses = {
  sm: "h-4 w-4",
  md: "h-8 w-8",
  lg: "h-12 w-12",
};

const textSizeClasses = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-lg",
};

export function LoadingState({
  message = "Loading...",
  size = "md",
  className,
  fullScreen = false,
}: LoadingStateProps) {
  const content = (
    <div className={cn("flex flex-col items-center gap-4", className)}>
      <Loader2 className={cn("animate-spin", sizeClasses[size])} />
      {message && (
        <p className={cn("text-muted-foreground", textSizeClasses[size])}>
          {message}
        </p>
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