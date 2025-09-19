import { createAuthClient } from "better-auth/react";
import type { AuthInstance } from "@/shared/config/auth/auth";
import {
  inferAdditionalFields,
  emailOTPClient,
  usernameClient,
} from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL!,
  plugins: [
    inferAdditionalFields<AuthInstance>(),
    emailOTPClient(),
    usernameClient(),
  ],
});
