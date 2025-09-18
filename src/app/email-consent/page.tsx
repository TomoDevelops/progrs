import { Suspense } from "react";
import { EmailConsentContainer } from "@/features/email-consent/components/EmailConsentContainer/EmailConsentContainer";

export default function EmailConsentPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <EmailConsentContainer />
    </Suspense>
  );
}
