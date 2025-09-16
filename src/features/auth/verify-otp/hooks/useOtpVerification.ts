"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/shared/lib/auth-client";
import { useCountdown } from "@/shared/hooks/useCountdown";

export interface UseOtpVerificationReturn {
  isLoading: boolean;
  isResending: boolean;
  error: string;
  countdown: number;
  email: string;
  type: string;
  isEmailVerification: boolean;
  isPasswordReset: boolean;
  handleFormSubmit: (otpCode: string) => Promise<void>;
  handleResendOTP: () => Promise<void>;
  getTitle: () => string;
  getDescription: () => string;
}

export const useOtpVerification = (): UseOtpVerificationReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();

  const { countdown, start: startCountdown } = useCountdown();

  const email = searchParams.get("email") || "";
  const type = searchParams.get("type") || "email-verification";

  const isEmailVerification = type === "email-verification";
  const isPasswordReset = type === "password-reset";

  const handleFormSubmit = async (otpCode: string) => {
    if (otpCode.length !== 6) {
      setError("Please enter the complete 6-digit code");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      if (isEmailVerification) {
        const { error } = await authClient.emailOtp.verifyEmail({
          email,
          otp: otpCode,
        });

        if (error) {
          setError(error.message || "Invalid verification code");
        } else {
          router.push("/");
        }
      } else if (isPasswordReset) {
        // Store OTP for password reset flow
        sessionStorage.setItem("reset-otp", otpCode);
        sessionStorage.setItem("reset-email", email);
        router.push("/reset-password");
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (countdown > 0) return;

    setIsResending(true);
    setError("");

    try {
      if (isEmailVerification) {
        const { error } = await authClient.emailOtp.sendVerificationOtp({
          email,
          type: "email-verification",
        });

        if (error) {
          setError(error.message || "Failed to resend code");
        } else {
          startCountdown(60);
        }
      } else if (isPasswordReset) {
        const { error } = await authClient.forgetPassword({
          email,
          redirectTo:
            "/verify-otp?type=password-reset&email=" +
            encodeURIComponent(email),
        });

        if (error) {
          setError(error.message || "Failed to resend code");
        } else {
          startCountdown(60);
        }
      }
    } catch {
      setError("Failed to resend code");
    } finally {
      setIsResending(false);
    }
  };

  const getTitle = () => {
    if (isEmailVerification) return "Verify your email";
    if (isPasswordReset) return "Enter verification code";
    return "Verify OTP";
  };

  const getDescription = () => {
    if (isEmailVerification) {
      return `We sent a verification code to ${email}. Enter the code below to verify your email address.`;
    }
    if (isPasswordReset) {
      return `We sent a verification code to ${email}. Enter the code below to reset your password.`;
    }
    return `Enter the 6-digit code sent to ${email}`;
  };

  return {
    isLoading,
    isResending,
    error,
    countdown,
    email,
    type,
    isEmailVerification,
    isPasswordReset,
    handleFormSubmit,
    handleResendOTP,
    getTitle,
    getDescription,
  };
};
