import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/shared/db/database";
import { oneTap, emailOTP, twoFactor, username } from "better-auth/plugins";
import { nextCookies } from "better-auth/next-js";
import { betterAuth } from "better-auth";
import { Resend } from "resend";
import {
  account,
  session,
  user,
  verification,
  twoFactor as twoFactorTable,
} from "@/shared/db/schema/auth-schema";
import { serverEnv } from "@/shared/config/env";

const resend = serverEnv.RESEND_API_KEY ? new Resend(serverEnv.RESEND_API_KEY) : null;

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user,
      session,
      verification,
      account,
      twoFactor: twoFactorTable,
    },
  }),
  appName: process.env.APP_NAME || "Progrs",
  baseURL: serverEnv.BETTER_AUTH_URL,
  secret: serverEnv.BETTER_AUTH_SECRET,
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: serverEnv.GOOGLE_CLIENT_ID || 'fallback-client-id',
      clientSecret: serverEnv.GOOGLE_CLIENT_SECRET || 'fallback-client-secret',
    },
  },
  plugins: [
    username(),
    twoFactor(),
    emailOTP({
      async sendVerificationOTP({ email, otp, type }) {
        console.log("sendVerificationOTP", email, otp, type);
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

        if (!resend) {
          console.error('Resend API key not configured');
          throw new Error('Email service not configured');
        }
        
        await resend.emails.send({
          from: serverEnv.EMAIL_FROM || 'noreply@example.com',
          to: email,
          subject,
          html,
        });
      },
    }),
    oneTap(),
    nextCookies(),
  ],
});
