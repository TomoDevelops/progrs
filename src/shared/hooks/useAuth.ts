"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/shared/lib/auth-client";

export type SocialProvider = "google" | "line";
export type AuthContext = "login" | "signup";

export interface UseSocialAuthReturn {
  // UI state
  isLoading: boolean;
  error: string;

  // Actions
  handleSocialAuth: (provider: SocialProvider, context: AuthContext) => Promise<void>;
  handleSocialAuthWithConsent: (provider: SocialProvider) => Promise<void>;
}

export const useAuth = (): UseSocialAuthReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  /**
   * Handles social authentication by redirecting to email consent page first
   * @param provider - The social provider (google or line)
   * @param context - Whether this is for login or signup flow
   */
  const handleSocialAuth = async (provider: SocialProvider, context: AuthContext) => {
    try {
      setError("");
      // Redirect to email consent page with provider and context info
      router.push(`/email-consent?provider=${provider}&context=${context}`);
    } catch {
      setError(`Failed to initiate ${provider} authentication`);
    }
  };

  /**
   * Handles the actual OAuth flow after user has given consent
   * This is called from the email consent page
   * @param provider - The social provider (google or line)
   */
  const handleSocialAuthWithConsent = async (provider: SocialProvider) => {
    setIsLoading(true);
    setError("");

    try {
      await authClient.signIn.social({
        provider,
        callbackURL: "/",
      });
    } catch {
      setError(`Failed to authenticate with ${provider}`);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    handleSocialAuth,
    handleSocialAuthWithConsent,
  };
};