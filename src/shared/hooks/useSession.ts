"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { authClient } from "@/shared/lib/auth-client";

interface UserData {
  id: string;
  name: string;
  email: string;
  username?: string;
  emailVerified: boolean;
  twoFactorEnabled: boolean;
}

interface SessionData {
  user: UserData;
}

const fetchSession = async (): Promise<SessionData | null> => {
  const session = await authClient.getSession();
  if (!session.data?.user) {
    return null;
  }
  return session.data as SessionData;
};

export const useSession = (options?: { redirectOnError?: boolean }) => {
  const router = useRouter();
  const { redirectOnError = false } = options || {};

  return useQuery({
    queryKey: ["session"],
    queryFn: fetchSession,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
    throwOnError: (error) => {
      if (redirectOnError) {
        router.push("/login");
      }
      return false;
    },
  });
};

export const useAuthenticatedSession = () => {
  const router = useRouter();

  return useQuery({
    queryKey: ["session"],
    queryFn: fetchSession,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
    throwOnError: (error, query) => {
      router.push("/login");
      return false;
    },
    select: (data) => {
      if (!data) {
        router.push("/login");
        throw new Error("No session found");
      }
      return data;
    },
  });
};
