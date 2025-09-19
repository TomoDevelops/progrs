export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

import { Suspense } from "react";
import { LoginContainer } from "@/features/auth/login/components/LoginContainer";
import { LoadingState } from "@/shared/components/LoadingState";

function LoginFallback() {
  return <LoadingState message="Loading login..." fullScreen />;
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginContainer />
    </Suspense>
  );
}
