export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

import { SignupContainer } from "@/features/auth/signup/components/SignupContainer";

export default function SignUpPage() {
  return <SignupContainer />;
}
