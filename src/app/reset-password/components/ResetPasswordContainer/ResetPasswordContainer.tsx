"use client";

import { useResetPassword } from "../../hooks/useResetPassword";
import { ResetPasswordForm } from "../ResetPasswordForm";

export const ResetPasswordContainer = () => {
  const resetPasswordState = useResetPassword();

  return <ResetPasswordForm resetPasswordState={resetPasswordState} />;
};