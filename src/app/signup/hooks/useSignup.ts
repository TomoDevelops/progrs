"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

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
}

export const useSignup = (): UseSignupReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleFormSubmit = async (data: SignupFormData) => {
    setIsLoading(true);
    setError("");

    try {
      const { data: _authData, error } = await authClient.signUp.email({
        email: data.email,
        password: data.password,
        username: data.username,
        name: data.username,
      });

      if (error) {
        setError(error.message || "Failed to create account");
      } else {
        router.push("/verify-otp?type=email-verification&email=" + encodeURIComponent(data.email));
      }
    } catch (_err) {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: "/dashboard",
      });
    } catch (_err) {
      setError("Failed to sign up with Google");
    }
  };

  return {
    isLoading,
    error,
    handleFormSubmit,
    handleGoogleSignUp,
  };
};