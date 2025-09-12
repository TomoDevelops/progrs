"use client";

import { useResetPassword } from "@/app/reset-password/hooks/useResetPassword";
import { ResetPasswordForm } from "@/app/reset-password/components/ResetPasswordForm";

export const ResetPasswordContainer = () => {
  const resetPasswordState = useResetPassword();

  return <ResetPasswordForm resetPasswordState={resetPasswordState} />;
};