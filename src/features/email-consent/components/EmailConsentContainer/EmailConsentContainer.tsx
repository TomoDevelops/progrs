"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/shared/components/ui/button";
import { Checkbox } from "@/shared/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Mail, Shield, Info } from "lucide-react";
import { toast } from "sonner";
import { useAuth, type SocialProvider } from "@/shared/hooks/useAuth";

export function EmailConsentContainer() {
  const [hasConsented, setHasConsented] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    handleSocialAuthWithConsent,
    isLoading: authLoading,
    error: authError,
  } = useAuth();

  // Get URL parameters
  const provider = searchParams.get("provider") as SocialProvider | null;
  const context = searchParams.get("context"); // 'login' or 'signup'

  const handleSubmit = async () => {
    if (!hasConsented) {
      toast.error("Please provide your consent to continue");
      return;
    }

    if (!provider) {
      toast.error("Invalid authentication provider");
      return;
    }

    setIsSubmitting(true);
    try {
      // Here you would typically save the consent to your backend
      // For now, we'll just simulate the process
      await new Promise((resolve) => setTimeout(resolve, 500));

      toast.success("Thank you for providing your consent!");

      // Trigger OAuth flow with the selected provider
      await handleSocialAuthWithConsent(provider);
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-2xl space-y-8">
        {/* Logo */}
        <div className="text-center">
          <div className="mb-8 flex items-center justify-center">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
              <span className="text-sm font-bold text-white">P</span>
            </div>
            <span className="ml-2 text-xl font-semibold">Progrs</span>
          </div>
        </div>

        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-6 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
              <Mail className="h-6 w-6 text-blue-600" />
            </div>
            <CardTitle className="text-2xl font-bold">
              Email Permission Request
            </CardTitle>
            <CardDescription className="text-base">
              {context === "signup"
                ? "Before creating your account, we'd like your permission to send you important emails"
                : "We'd like your permission to send you important emails about your account"}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Email Usage Explanation */}
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                  <Shield className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    Account Security
                  </h3>
                  <p className="mt-1 text-sm text-gray-600">
                    We&apos;ll send you important security notifications,
                    password reset emails, and account verification messages to
                    keep your account safe.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                  <Info className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    Service Updates
                  </h3>
                  <p className="mt-1 text-sm text-gray-600">
                    Occasionally, we may send you updates about new features,
                    important changes to our service, or maintenance
                    notifications.
                  </p>
                </div>
              </div>
            </div>

            {/* What we DON'T do */}
            <div className="rounded-lg bg-gray-50 p-4">
              <h3 className="mb-2 font-semibold text-gray-900">
                What we don&apos;t do:
              </h3>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• We don&apos;t send promotional or marketing emails</li>
                <li>• We don&apos;t share your email with third parties</li>
                <li>• We don&apos;t send spam or unnecessary notifications</li>
                <li>• You can unsubscribe from non-essential emails anytime</li>
              </ul>
            </div>

            {/* Consent Checkbox */}
            <div className="border-t pt-6">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="email-consent"
                  checked={hasConsented}
                  onCheckedChange={(checked) =>
                    setHasConsented(checked as boolean)
                  }
                  className="mt-1"
                />
                <label
                  htmlFor="email-consent"
                  className="cursor-pointer text-sm leading-relaxed text-gray-700"
                >
                  I understand and consent to receiving emails from Progrs for
                  account security, service updates, and essential
                  communications. I understand that I can unsubscribe from
                  non-essential emails at any time.
                </label>
              </div>
            </div>

            {/* Error Display */}
            {authError && (
              <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                {authError}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 pt-4 sm:flex-row">
              <Button
                onClick={handleSubmit}
                disabled={
                  !hasConsented || isSubmitting || authLoading || !provider
                }
                className="flex-1"
              >
                {isSubmitting || authLoading
                  ? "Processing..."
                  : "I Agree & Continue"}
              </Button>
              <Button
                variant="outline"
                onClick={() => router.back()}
                className="flex-1"
                disabled={isSubmitting || authLoading}
              >
                Go Back
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Footer Note */}
        <div className="text-center text-xs text-gray-500">
          By continuing, you acknowledge that you have read and understood our
          email practices.
        </div>
      </div>
    </div>
  );
}
