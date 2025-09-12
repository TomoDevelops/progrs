"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

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
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const session = await authClient.getSession();
        if (!session.data?.user) {
          router.push("/login");
          return;
        }
        setUser(session.data.user as UserData);
      } catch {
        router.push("/login");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  const handleSignOut = async () => {
    try {
      await authClient.signOut();
      router.push("/login");
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  return {
    user,
    isLoading,
    handleSignOut,
  };
};
