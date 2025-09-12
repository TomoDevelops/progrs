"use client";

import { useForgotPassword } from "@/features/auth/forgot-password/hooks/useForgotPassword";
import { ForgotPasswordForm } from "@/features/auth/forgot-password/components/ForgotPasswordForm";

export const ForgotPasswordContainer = () => {
  const forgotPasswordState = useForgotPassword();

  return <ForgotPasswordForm forgotPasswordState={forgotPasswordState} />;
};
