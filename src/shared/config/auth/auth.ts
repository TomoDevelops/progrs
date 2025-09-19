import "server-only";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { emailOTP, username } from "better-auth/plugins";
import { nextCookies } from "better-auth/next-js";


import { getDb } from "@/shared/db/database";
import {
  account,
  session,
  user,
  verification,
} from "@/shared/db/schema/auth-schema";
import { getEnv } from "@/shared/env";
import { sendEmail } from "@/shared/lib/email";

let _auth: ReturnType<typeof betterAuth> | undefined;

export function getAuth() {
  if (_auth) return _auth;

  const env = getEnv();
  const db = getDb();

  const plugins = [
    username(),
    emailOTP({
      async sendVerificationOTP({ email, otp, type }) {
        let emailType: "otp-signin" | "otp-email-verification" | "otp-password-reset";
        
        switch (type) {
          case "sign-in":
            emailType = "otp-signin";
            break;
          case "email-verification":
            emailType = "otp-email-verification";
            break;
          default:
            emailType = "otp-password-reset";
            break;
        }

        await sendEmail({
          to: email,
          type: emailType,
          data: {
            otp,
            expirationMinutes: 5,
          },
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
    user: {
      deleteUser: {
        enabled: true,
      },
      changeEmail: {
        enabled: true,
        sendChangeEmailVerification: async (
          { user, newEmail, url, token },
        ) => {
          await sendEmail({
            to: user.email,
            type: "email-change-verification",
            data: {
               currentEmail: user.email,
               newEmail,
               verificationUrl: url,
               token,
             },
          });
        },
      },
    },
    plugins: [...plugins],
  } satisfies Parameters<typeof betterAuth>[0]);

  return _auth;
}

export type AuthInstance = ReturnType<typeof getAuth>;
