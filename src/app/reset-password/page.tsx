export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

import { ResetPasswordContainer } from "@/features/auth/reset-password/components/ResetPasswordContainer";

export default function ResetPasswordPage() {
  return <ResetPasswordContainer />;
}
