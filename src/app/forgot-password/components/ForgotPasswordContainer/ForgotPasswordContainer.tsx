"use client";

import { useForgotPassword } from "@/app/forgot-password/hooks/useForgotPassword";
import { ForgotPasswordForm } from "@/app/forgot-password/components/ForgotPasswordForm";

export const ForgotPasswordContainer = () => {
  const forgotPasswordState = useForgotPassword();

  return <ForgotPasswordForm forgotPasswordState={forgotPasswordState} />;
};
