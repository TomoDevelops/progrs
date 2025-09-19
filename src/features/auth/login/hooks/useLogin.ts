"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { authClient } from "@/shared/lib/auth-client";
import { useAuth } from "@/shared/hooks/useAuth";

export interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface UseLoginReturn {
  // UI state
  isLoading: boolean;
  error: string;
  successMessage: string;

  // Actions
  handleFormSubmit: (data: LoginFormData) => Promise<void>;
  handleGoogleSignIn: () => Promise<void>;
  handleLineSignIn: () => Promise<void>;
}

export const useLogin = (): UseLoginReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { handleSocialAuth, error: authError } = useAuth();

  // Handle success message directly from searchParams without useEffect
  const message = searchParams.get("message");
  const successMessage =
    message === "password-reset-success"
      ? "Password reset successfully! Please log in with your new password."
      : "";

  const handleFormSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError("");

    try {
      const { error } = await authClient.signIn.email({
        email: data.email,
        password: data.password,
        rememberMe: data.rememberMe,
      });

      if (error) {
        setError(error.message || "Failed to sign in");
        return;
      }
      queryClient.invalidateQueries({ queryKey: ["session"] });

      router.push("/");
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setError("");
      await handleSocialAuth("google", "login");
    } catch {
      setError("Failed to initiate Google sign in");
    }
  };

  const handleLineSignIn = async () => {
    try {
      setError("");
      await handleSocialAuth("line", "login");
    } catch {
      setError("Failed to initiate LINE sign in");
    }
  };

  return {
    isLoading,
    error: error || authError,
    successMessage,
    handleFormSubmit,
    handleGoogleSignIn,
    handleLineSignIn,
  };
};
