"use client";

import { useOtpVerification } from "@/features/auth/verify-otp/hooks/useOtpVerification";
import { OtpForm } from "@/features/auth/verify-otp/components/OtpForm";

export const OtpContainer = () => {
  const otpState = useOtpVerification();

  return <OtpForm otpState={otpState} />;
};
