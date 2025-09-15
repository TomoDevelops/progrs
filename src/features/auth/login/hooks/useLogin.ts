"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/shared/lib/auth-client";

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
}

export const useLogin = (): UseLoginReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();

  // Handle success message directly from searchParams without useEffect
  const message = searchParams.get("message");
  const successMessage = message === "password-reset-success" 
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
      } else {
        router.push("/");
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: "/",
      });
    } catch {
      setError("Failed to sign in with Google");
    }
  };

  return {
    isLoading,
    error,
    successMessage,
    handleFormSubmit,
    handleGoogleSignIn,
  };
};
