import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/shared/config/auth/auth";
import { DashboardContainer } from "@/features/dashboard/components/DashboardContainer";

export default async function Home() {
  // Check authentication server-side before rendering any UI
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Redirect to login if no session exists
  if (!session) {
    redirect("/login");
  }

  return <DashboardContainer />;
}
