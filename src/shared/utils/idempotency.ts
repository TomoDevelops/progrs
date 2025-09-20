import { getDb } from "@/shared/db/database";
import { aiGenerationRequests } from "@/shared/db/schema/app-schema";
import { eq } from "drizzle-orm";

export interface IdempotencyResult<T> {
  isNew: boolean;
  data: T | null;
}

export async function checkIdempotency<T>(
  key: string,
  userId: string
): Promise<IdempotencyResult<T>> {
  const db = getDb();

  try {
    // Check if request with this idempotency key already exists
    const existingRequest = await db
      .select()
      .from(aiGenerationRequests)
      .where(
        eq(aiGenerationRequests.idempotencyKey, key)
      )
      .limit(1);

    if (existingRequest.length > 0) {
      const request = existingRequest[0];
      
      // Verify the request belongs to the same user
      if (request.userId !== userId) {
        throw new Error('Idempotency key conflict');
      }

      // Return existing result if completed
      if (request.status === 'completed' && request.result) {
        return {
          isNew: false,
          data: JSON.parse(request.result) as T,
        };
      }

      // If still processing, return null data
      return {
        isNew: false,
        data: null,
      };
    }

    // No existing request found
    return {
      isNew: true,
      data: null,
    };
  } catch (error) {
    console.error('Error checking idempotency:', error);
    throw error;
  }
}

export async function storeIdempotencyResult<T>(
  key: string,
  userId: string,
  data: T
): Promise<void> {
  const db = getDb();

  try {
    // Update the request with the result
    await db
      .update(aiGenerationRequests)
      .set({
        status: 'completed',
        result: JSON.stringify(data),
        completedAt: new Date(),
      })
      .where(
        eq(aiGenerationRequests.idempotencyKey, key)
      );
  } catch (error) {
    console.error('Error storing idempotency result:', error);
    throw error;
  }
}