import { createAuthClient } from "better-auth/react";
import type { auth } from "@/shared/config/auth/auth";
import {
  inferAdditionalFields,
  oneTapClient,
  emailOTPClient,
  twoFactorClient,
  usernameClient,
} from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:3000",
  plugins: [
    inferAdditionalFields<typeof auth>(),
    oneTapClient({
      clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "",
    }),
    emailOTPClient(),
    twoFactorClient(),
    usernameClient(),
  ],
});
