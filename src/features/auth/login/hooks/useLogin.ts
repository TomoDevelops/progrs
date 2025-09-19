"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { authClient } from "@/shared/lib/auth-client";
import { useAuth } from "@/shared/hooks/useAuth";
import { useAsyncSubmit } from "@/shared/hooks/useAsyncState";

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
  handleFormSubmit: (data: LoginFormData) => Promise<unknown>;
  handleGoogleSignIn: () => Promise<void>;
  handleLineSignIn: () => Promise<void>;
}

export const useLogin = (): UseLoginReturn => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { handleSocialAuth, error: authError } = useAuth();

  const {
    isLoading,
    error: formError,
    handleSubmit: handleFormSubmit,
  } = useAsyncSubmit(
    async (data: LoginFormData) => {
      const { error } = await authClient.signIn.email({
        email: data.email,
        password: data.password,
        rememberMe: data.rememberMe,
      });

      if (error) {
        throw new Error(error.message || "Failed to sign in");
      }

      queryClient.invalidateQueries({ queryKey: ["session"] });
      router.push("/");
    },
    {
      onError: (error) => {
        console.error("Login error:", error);
      },
    }
  );

  // Handle success message directly from searchParams without useEffect
  const message = searchParams.get("message");
  const successMessage =
    message === "password-reset-success"
      ? "Password reset successfully! Please log in with your new password."
      : "";



  const handleGoogleSignIn = async () => {
    try {
      await handleSocialAuth("google", "login");
    } catch (error) {
      console.error("Google sign in error:", error);
    }
  };

  const handleLineSignIn = async () => {
    try {
      await handleSocialAuth("line", "login");
    } catch (error) {
      console.error("LINE sign in error:", error);
    }
  };

  return {
    isLoading,
    error: formError || authError,
    successMessage,
    handleFormSubmit,
    handleGoogleSignIn,
    handleLineSignIn,
  };
};
