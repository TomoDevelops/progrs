import { createAuthClient } from "better-auth/react";
import type { auth } from "@/shared/config/auth/auth";
import {
  inferAdditionalFields,
  oneTapClient,
  emailOTPClient,
  twoFactorClient,
  usernameClient,
} from "better-auth/client/plugins";
import { clientEnv } from "@/shared/config/env";

export const authClient = createAuthClient({
  baseURL: clientEnv.NEXT_PUBLIC_BETTER_AUTH_URL,
  plugins: [
    inferAdditionalFields<typeof auth>(),
    oneTapClient({
       clientId: clientEnv.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "",
     }),
    emailOTPClient(),
    twoFactorClient(),
    usernameClient(),
  ],
});
