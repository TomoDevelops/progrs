"use client";

import { useOtpVerification } from "@/app/verify-otp/hooks/useOtpVerification";
import { OtpForm } from "@/app/verify-otp/components/OtpForm";

export const OtpContainer = () => {
  const otpState = useOtpVerification();

  return <OtpForm otpState={otpState} />;
};
