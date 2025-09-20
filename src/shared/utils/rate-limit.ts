import { getDb } from "@/shared/db/database";
import { rateLimits } from "@/shared/db/schema/app-schema";
import { eq, and, gte, lt } from "drizzle-orm";

type RateLimitRecord = typeof rateLimits.$inferSelect;

interface RateLimitOptions {
  key: string;
  limit: number;
  window: number; // in milliseconds
}

interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetTime: number;
}

export async function rateLimit(options: RateLimitOptions): Promise<RateLimitResult> {
  const { key, limit, window } = options;
  const now = Date.now();
  const windowStart = now - window;
  const db = getDb();

  try {
    // Use transaction to ensure atomicity
    return await db.transaction(async (tx) => {
      // Clean up old entries (records older than the window)
      await tx
        .delete(rateLimits)
        .where(
          and(
            eq(rateLimits.identifier, key),
            lt(rateLimits.createdAt, new Date(windowStart))
          )
        );

      // Count current requests in window
      const currentRequests = await tx
        .select()
        .from(rateLimits)
        .where(
          and(
            eq(rateLimits.identifier, key),
            gte(rateLimits.createdAt, new Date(windowStart))
          )
        );

      if (currentRequests.length >= limit) {
        // Find the oldest request to determine reset time
        const oldestRequest = currentRequests.sort(
          (a: RateLimitRecord, b: RateLimitRecord) => a.createdAt.getTime() - b.createdAt.getTime()
        )[0];
        
        const resetTime = oldestRequest.createdAt.getTime() + window - now;
        
        return {
          success: false,
          remaining: 0,
          resetTime: Math.max(0, resetTime),
        };
      }

      // Add new request
      await tx.insert(rateLimits).values({
        id: crypto.randomUUID(),
        identifier: key,
        action: 'generate-workout',
        createdAt: new Date(now),
      });

      return {
        success: true,
        remaining: limit - currentRequests.length - 1,
        resetTime: window,
      };
    });
  } catch (error) {
    console.error("Rate limit error:", error);
    // On error, allow the request (fail open)
    return {
      success: true,
      remaining: limit - 1,
      resetTime: window,
    };
  }
}