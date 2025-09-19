import "server-only";

function must(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`[env] Missing ${name} at runtime`);
  return v;
}

export function getEnv() {
  return {
    APP_NAME: process.env.APP_NAME ?? "Progrs",
    APP_URL: process.env.APP_URL ?? "http://localhost:3000",
    DATABASE_URL: must("DATABASE_URL"),
    BETTER_AUTH_SECRET: must("BETTER_AUTH_SECRET"),
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
    EMAIL_FROM: must("EMAIL_FROM"),
    RESEND_API_KEY: must("RESEND_API_KEY"),
    GOOGLE_CLIENT_ID: must("GOOGLE_CLIENT_ID"),
    GOOGLE_CLIENT_SECRET: must("GOOGLE_CLIENT_SECRET"),
    LINE_CLIENT_ID: must("LINE_CLIENT_ID"),
    LINE_CLIENT_SECRET: must("LINE_CLIENT_SECRET"),
  };
}
