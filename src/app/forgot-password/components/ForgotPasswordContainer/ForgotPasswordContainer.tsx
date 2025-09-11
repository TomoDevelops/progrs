"use client";

import { useForgotPassword } from "../../hooks/useForgotPassword";
import { ForgotPasswordForm } from "../ForgotPasswordForm";

export const ForgotPasswordContainer = () => {
  const forgotPasswordState = useForgotPassword();

  return <ForgotPasswordForm forgotPasswordState={forgotPasswordState} />;
};