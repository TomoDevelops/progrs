import "server-only";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { getEnv } from "@/shared/env";

let _db: ReturnType<typeof drizzle> | undefined;

export function getDb() {
  if (_db) return _db;
  const { DATABASE_URL } = getEnv();

  // Use a Pool so $client is typed as Pool (what your consumers expect)
  const pool = new Pool({
    connectionString: DATABASE_URL,
    // optional tuning:
    max: 5, // or 1 if you want single-conn behavior
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000,
  });

  _db = drizzle(pool); // <- $client: Pool
  return _db;
}
