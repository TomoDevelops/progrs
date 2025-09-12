import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db/database";
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
} from "@/db/schema/auth-schema";

const resend = new Resend(process.env.RESEND_API_KEY);

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
    baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
    secret: process.env.BETTER_AUTH_SECRET!,
    emailAndPassword: {
        enabled: true,
    },
    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        },
    },
    plugins: [
        username(),
        twoFactor(),
        emailOTP({
            async sendVerificationOTP({ email, otp, type }, _request) {
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

                await resend.emails.send({
                    from: process.env.EMAIL_FROM!,
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
