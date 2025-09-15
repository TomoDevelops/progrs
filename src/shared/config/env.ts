import { z } from "zod";

// Server-side environment variables schema
const serverEnvSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  BETTER_AUTH_SECRET: z.string().min(1, "BETTER_AUTH_SECRET is required"),
  BETTER_AUTH_URL: z.url("BETTER_AUTH_URL must be a valid URL"),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().optional(),
  APP_NAME: z.string().default("Progrs"),
});

// Client-side environment variables schema
const clientEnvSchema = z.object({
  NEXT_PUBLIC_BETTER_AUTH_URL: z.url(
    "NEXT_PUBLIC_BETTER_AUTH_URL must be a valid URL",
  ),
  NEXT_PUBLIC_GOOGLE_CLIENT_ID: z.string().optional(),
});

// Validate server environment variables
function validateServerEnv() {
  try {
    return serverEnvSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.issues
        .map((err: z.ZodIssue) => `${err.path.join(".")}: ${err.message}`)
        .join("\n");
      throw new Error(`Environment validation failed:\n${missingVars}`);
    }
    throw error;
  }
}

// Validate client environment variables
function validateClientEnv() {
  try {
    return clientEnvSchema.parse({
      NEXT_PUBLIC_BETTER_AUTH_URL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL,
      NEXT_PUBLIC_GOOGLE_CLIENT_ID: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.issues
        .map((err: z.ZodIssue) => `${err.path.join(".")}: ${err.message}`)
        .join("\n");
      throw new Error(`Client environment validation failed:\n${missingVars}`);
    }
    throw error;
  }
}

// Helper function to get environment variable with fallback and warning
export function getEnvVar(key: string, fallback?: string): string {
  const value = process.env[key];

  if (!value) {
    if (fallback !== undefined) {
      if (process.env.NODE_ENV !== "production") {
        console.warn(
          `⚠️  Environment variable ${key} is not set, using fallback: ${fallback}`,
        );
      }
      return fallback;
    }
    throw new Error(`Environment variable ${key} is required but not set`);
  }

  return value;
}

// Export validated environment variables
export const serverEnv = validateServerEnv();
export const clientEnv = validateClientEnv();

// Type exports
export type ServerEnv = z.infer<typeof serverEnvSchema>;
export type ClientEnv = z.infer<typeof clientEnvSchema>;
