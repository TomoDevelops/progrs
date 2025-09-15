import { Suspense } from "react";
import { OtpContainer } from "@/features/auth/verify-otp/components/OtpContainer";
import { Loader2 } from "lucide-react";

function OtpFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin" />
    </div>
  );
}

export default function VerifyOTPPage() {
  return (
    <Suspense fallback={<OtpFallback />}>
      <OtpContainer />
    </Suspense>
  );
}
