export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { getAuth } from "@/shared/config/auth/auth";

import { SuggestionsPage } from "@/features/suggestions/components/suggestions-page";

export default async function Page() {
  // Check authentication server-side before rendering any UI
  const auth = getAuth();
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Redirect to login if no session exists
  if (!session) {
    redirect("/login");
  }

  return <SuggestionsPage />;
}
