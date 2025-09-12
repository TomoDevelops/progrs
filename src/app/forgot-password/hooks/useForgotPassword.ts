"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export interface UseForgotPasswordReturn {
  email: string;
  setEmail: (email: string) => void;
  isLoading: boolean;
  error: string | null;
  isSuccess: boolean;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  handleFormSubmit: (email: string) => Promise<void>;
  handleContinue: () => void;
}

export const useForgotPassword = (): UseForgotPasswordReturn => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError("Please enter your email address");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    await handleFormSubmit(email);
  };

  const handleFormSubmit = async (emailValue: string) => {
    setIsLoading(true);
    setError(null);

    try {
      await authClient.forgetPassword({
        email: emailValue,
        redirectTo: "/reset-password",
      });
      setIsSuccess(true);
    } catch (_err) {
      setError("Failed to send reset email. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinue = () => {
    router.push("/verify-otp?type=password-reset&email=" + encodeURIComponent(email));
  };

  return {
    email,
    setEmail,
    isLoading,
    error,
    isSuccess,
    handleSubmit,
    handleFormSubmit,
    handleContinue,
  };
};