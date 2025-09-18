"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/shared/lib/auth-client";
import { useAuth } from "@/shared/hooks/useAuth";

export interface SignupFormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface UseSignupReturn {
  // UI state
  isLoading: boolean;
  error: string;

  // Actions
  handleFormSubmit: (data: SignupFormData) => Promise<void>;
  handleGoogleSignUp: () => Promise<void>;
  handleLineSignUp: () => Promise<void>;
}

export const useSignup = (): UseSignupReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const { handleSocialAuth, error: authError } = useAuth();

  const handleFormSubmit = async (data: SignupFormData) => {
    setIsLoading(true);
    setError("");

    try {
      const { error } = await authClient.signUp.email({
        email: data.email,
        password: data.password,
        username: data.username,
        name: data.username,
      });

      if (error) {
        setError(error.message || "Failed to create account");
        return;
      }

      router.push(
        "/verify-otp?type=email-verification&email=" +
          encodeURIComponent(data.email),
      );
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      setError("");
      await handleSocialAuth("google", "signup");
    } catch {
      setError("Failed to initiate Google sign up");
    }
  };

  const handleLineSignUp = async () => {
    try {
      setError("");
      await handleSocialAuth("line", "signup");
    } catch {
      setError("Failed to initiate LINE sign up");
    }
  };

  return {
    isLoading,
    error: error || authError,
    handleFormSubmit,
    handleGoogleSignUp,
    handleLineSignUp,
  };
};
