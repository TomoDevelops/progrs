"use client";

import { useRouter } from "next/navigation";
import { authClient } from "@/shared/lib/auth-client";
import { useAuth } from "@/shared/hooks/useAuth";
import { useAsyncSubmit } from "@/shared/hooks/useAsyncState";

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
  handleFormSubmit: (data: SignupFormData) => Promise<unknown>;
  handleGoogleSignUp: () => Promise<void>;
  handleLineSignUp: () => Promise<void>;
}

export const useSignup = (): UseSignupReturn => {
  const router = useRouter();
  const { handleSocialAuth, error: authError } = useAuth();

  const {
    isLoading,
    error: formError,
    handleSubmit: handleFormSubmit,
  } = useAsyncSubmit(
    async (data: SignupFormData) => {
      const { error } = await authClient.signUp.email({
        email: data.email,
        password: data.password,
        username: data.username,
        name: data.username,
      });

      if (error) {
        throw new Error(error.message || "Failed to create account");
      }

      router.push(
        "/verify-otp?type=email-verification&email=" +
          encodeURIComponent(data.email)
      );
    },
    {
      onError: (error) => {
        console.error("Signup error:", error);
      },
    }
  );



  const handleGoogleSignUp = async () => {
    try {
      await handleSocialAuth("google", "signup");
    } catch (error) {
      console.error("Google sign up error:", error);
    }
  };

  const handleLineSignUp = async () => {
    try {
      await handleSocialAuth("line", "signup");
    } catch (error) {
      console.error("LINE sign up error:", error);
    }
  };

  return {
    isLoading,
    error: formError || authError,
    handleFormSubmit,
    handleGoogleSignUp,
    handleLineSignUp,
  };
};
