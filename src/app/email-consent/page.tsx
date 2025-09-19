export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

import { Suspense } from "react";
import { EmailConsentContainer } from "@/features/email-consent/components/EmailConsentContainer/EmailConsentContainer";

export default function EmailConsentPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <EmailConsentContainer />
    </Suspense>
  );
}
