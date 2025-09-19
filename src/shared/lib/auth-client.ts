import { createAuthClient } from "better-auth/react";
import type { AuthInstance } from "@/shared/config/auth/auth";
import {
  inferAdditionalFields,
  oneTapClient,
  emailOTPClient,
  twoFactorClient,
  usernameClient,
} from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL!,
  plugins: [
    inferAdditionalFields<AuthInstance>(),
    oneTapClient({
      clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
    }),
    emailOTPClient(),
    twoFactorClient(),
    usernameClient(),
  ],
});
