"use client";

import { useRouter } from "next/navigation";
import { authClient } from "@/shared/lib/auth-client";
import { useAuthenticatedSession } from "@/shared/hooks/useSession";

interface UserData {
  id: string;
  name: string;
  email: string;
  username?: string;
  emailVerified: boolean;
  twoFactorEnabled: boolean;
}

export interface UseDashboardReturn {
  // State
  user: UserData | null;
  isLoading: boolean;

  // Actions
  handleSignOut: () => Promise<void>;
}

export const useDashboard = (): UseDashboardReturn => {
  const router = useRouter();
  const { data: sessionData, isLoading } = useAuthenticatedSession();

  const handleSignOut = async () => {
    try {
      await authClient.signOut();
      router.push("/login");
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  return {
    user: sessionData?.user || null,
    isLoading,
    handleSignOut,
  };
};
