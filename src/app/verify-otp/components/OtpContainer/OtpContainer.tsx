"use client";

import { useOtpVerification } from "../../hooks/useOtpVerification";
import { OtpForm } from "../OtpForm";

export const OtpContainer = () => {
    const otpState = useOtpVerification();

    return <OtpForm otpState={otpState} />;
};
