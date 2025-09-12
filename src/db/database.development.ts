import "dotenv/config";
import { config } from "dotenv";
import { drizzle } from "drizzle-orm/node-postgres";

config({ path: ".env.development" });

export const db = drizzle(process.env.DATABASE_URL!);
