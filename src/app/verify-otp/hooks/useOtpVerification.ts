"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export interface UseOtpVerificationReturn {
  otp: string[];
  setOtp: (otp: string[]) => void;
  isLoading: boolean;
  isResending: boolean;
  error: string;
  countdown: number;
  inputRefs: React.MutableRefObject<(HTMLInputElement | null)[]>;
  email: string;
  type: string;
  isEmailVerification: boolean;
  isPasswordReset: boolean;
  handleInputChange: (index: number, value: string) => void;
  handleKeyDown: (index: number, e: React.KeyboardEvent) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  handleFormSubmit: (otpCode: string) => Promise<void>;
  handleResendOTP: () => Promise<void>;
  getTitle: () => string;
  getDescription: () => string;
}

export const useOtpVerification = (): UseOtpVerificationReturn => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();
  const searchParams = useSearchParams();

  const email = searchParams.get("email") || "";
  const type = searchParams.get("type") || "email-verification";

  const isEmailVerification = type === "email-verification";
  const isPasswordReset = type === "password-reset";

  useEffect(() => {
    // Focus first input on mount
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleInputChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Handle paste
      const pastedCode = value.slice(0, 6);
      const newOtp = [...otp];
      for (let i = 0; i < pastedCode.length && i < 6; i++) {
        newOtp[i] = pastedCode[i];
      }
      setOtp(newOtp);

      // Focus last filled input or next empty one
      const nextIndex = Math.min(pastedCode.length, 5);
      inputRefs.current[nextIndex]?.focus();
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpCode = otp.join("");

    if (otpCode.length !== 6) {
      setError("Please enter the complete 6-digit code");
      return;
    }

    await handleFormSubmit(otpCode);
  };

  const handleFormSubmit = async (otpCode: string) => {
    if (otpCode.length !== 6) {
      setError("Please enter the complete 6-digit code");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      if (isEmailVerification) {
        const { data: _data, error } = await authClient.emailOtp.verifyEmail({
          email,
          otp: otpCode,
        });

        if (error) {
          setError(error.message || "Invalid verification code");
        } else {
          router.push("/dashboard");
        }
      } else if (isPasswordReset) {
        // Store OTP for password reset flow
        sessionStorage.setItem("reset-otp", otpCode);
        sessionStorage.setItem("reset-email", email);
        router.push("/reset-password");
      }
    } catch (_err) {
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
          setCountdown(60);
          setOtp(["", "", "", "", "", ""]);
          inputRefs.current[0]?.focus();
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
          setCountdown(60);
          setOtp(["", "", "", "", "", ""]);
          inputRefs.current[0]?.focus();
        }
      }
    } catch (_err) {
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
    otp,
    setOtp,
    isLoading,
    isResending,
    error,
    countdown,
    inputRefs,
    email,
    type,
    isEmailVerification,
    isPasswordReset,
    handleInputChange,
    handleKeyDown,
    handleSubmit,
    handleFormSubmit,
    handleResendOTP,
    getTitle,
    getDescription,
  };
};
