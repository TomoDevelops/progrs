"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/shared/lib/auth-client";

export interface ResetPasswordFormData {
  password: string;
  confirmPassword: string;
}

export interface UseResetPasswordReturn {
  // Form state
  formData: ResetPasswordFormData;
  handleInputChange: (field: string, value: string) => void;
  showPassword: boolean;
  setShowPassword: (show: boolean) => void;
  showConfirmPassword: boolean;
  setShowConfirmPassword: (show: boolean) => void;

  // UI state
  isLoading: boolean;
  error: string;
  email: string;
  otp: string;

  // Actions
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  handleFormSubmit: (password: string) => Promise<void>;

  // Password validation
  validatePassword: (password: string) => string | null;
  getPasswordStrength: (password: string) => number;
  getStrengthColor: (strength: number) => string;
  getStrengthText: (strength: number) => string;
}

export const useResetPassword = (): UseResetPasswordReturn => {
  const [formData, setFormData] = useState<ResetPasswordFormData>({
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const router = useRouter();

  useEffect(() => {
    // Get email and OTP from session storage
    const storedEmail = sessionStorage.getItem("reset-email");
    const storedOtp = sessionStorage.getItem("reset-otp");

    if (!storedEmail || !storedOtp) {
      router.push("/forgot-password");
      return;
    }

    setEmail(storedEmail);
    setOtp(storedOtp);
  }, [router]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validatePassword = (password: string) => {
    if (password.length < 8) {
      return "Password must be at least 8 characters long";
    }
    if (!/(?=.*[a-z])/.test(password)) {
      return "Password must contain at least one lowercase letter";
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      return "Password must contain at least one uppercase letter";
    }
    if (!/(?=.*\d)/.test(password)) {
      return "Password must contain at least one number";
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    // Validate password strength
    const passwordError = validatePassword(formData.password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    await handleFormSubmit(formData.password);
  };

  const handleFormSubmit = async (password: string) => {
    setIsLoading(true);
    setError("");

    try {
      const { error } = await authClient.resetPassword({
        newPassword: password,
      });

      if (error) {
        setError(error.message || "Failed to reset password");
      } else {
        // Clear session storage
        sessionStorage.removeItem("reset-email");
        sessionStorage.removeItem("reset-otp");

        // Redirect to login with success message
        router.push("/login?message=password-reset-success");
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/(?=.*[a-z])/.test(password)) strength++;
    if (/(?=.*[A-Z])/.test(password)) strength++;
    if (/(?=.*\d)/.test(password)) strength++;
    if (/(?=.*[!@#$%^&*])/.test(password)) strength++;
    return strength;
  };

  const getStrengthColor = (strength: number) => {
    if (strength <= 1) return "bg-red-500";
    if (strength <= 2) return "bg-orange-500";
    if (strength <= 3) return "bg-yellow-500";
    if (strength <= 4) return "bg-blue-500";
    return "bg-green-500";
  };

  const getStrengthText = (strength: number) => {
    if (strength <= 1) return "Very weak";
    if (strength <= 2) return "Weak";
    if (strength <= 3) return "Fair";
    if (strength <= 4) return "Good";
    return "Strong";
  };

  return {
    formData,
    handleInputChange,
    showPassword,
    setShowPassword,
    showConfirmPassword,
    setShowConfirmPassword,
    isLoading,
    error,
    email,
    otp,
    handleSubmit,
    handleFormSubmit,
    validatePassword,
    getPasswordStrength,
    getStrengthColor,
    getStrengthText,
  };
};
