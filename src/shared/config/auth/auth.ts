import "server-only";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { emailOTP, username } from "better-auth/plugins";
import { nextCookies } from "better-auth/next-js";
import { Resend } from "resend";

import { getDb } from "@/shared/db/database";
import {
  account,
  session,
  user,
  verification,
} from "@/shared/db/schema/auth-schema";
import { getEnv } from "@/shared/env";

let _auth: ReturnType<typeof betterAuth> | undefined;

export function getAuth() {
  if (_auth) return _auth;

  const env = getEnv();
  const db = getDb();
  const resend = new Resend(env.RESEND_API_KEY!);

  const plugins = [
    username(),
    emailOTP({
      async sendVerificationOTP({ email, otp, type }) {
        const subject =
          type === "sign-in"
            ? "Sign in to your account"
            : type === "email-verification"
              ? "Verify your email address"
              : "Reset your password";

        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2>Your verification code</h2>
              <p>Use this code to ${
                type === "sign-in"
                  ? "sign in"
                  : type === "email-verification"
                    ? "verify your email"
                    : "reset your password"
              }:</p>
              <div style="background: #f5f5f5; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 8px; margin: 20px 0;">
                ${otp}
              </div>
              <p>This code will expire in 5 minutes.</p>
              <p>If you didn't request this code, please ignore this email.</p>
            </div>
          `;

        await resend.emails.send({
          from: env.EMAIL_FROM!,
          to: email,
          subject,
          html,
        });
      },
    }),
    nextCookies(),
  ] as const;

  _auth = betterAuth({
    database: drizzleAdapter(db, {
      provider: "pg",
      schema: {
        user,
        session,
        verification,
        account,
      },
    }),

    appName: env.APP_NAME!,
    baseURL: env.BETTER_AUTH_URL!,
    secret: env.BETTER_AUTH_SECRET!,

    emailAndPassword: { enabled: true },

    socialProviders: {
      google: {
        clientId: env.GOOGLE_CLIENT_ID!,
        clientSecret: env.GOOGLE_CLIENT_SECRET!,
      },
      line: {
        clientId: env.LINE_CLIENT_ID!,
        clientSecret: env.LINE_CLIENT_SECRET!,
        scope: ["openid", "profile"],
      },
    },
    plugins: [...plugins],
  } satisfies Parameters<typeof betterAuth>[0]);

  return _auth;
}

export type AuthInstance = ReturnType<typeof getAuth>;
