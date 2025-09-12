"use client";

import { useResetPassword } from "@/features/auth/reset-password/hooks/useResetPassword";
import { ResetPasswordForm } from "@/features/auth/reset-password/components/ResetPasswordForm";

export const ResetPasswordContainer = () => {
  const resetPasswordState = useResetPassword();

  return <ResetPasswordForm resetPasswordState={resetPasswordState} />;
};
