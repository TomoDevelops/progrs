import { NextRequest } from "next/server";
import { getAuth } from "@/shared/config/auth/auth";
import { ApiErrorResponse, ApiSuccessResponse } from "@/shared/types/api";
import { headers } from "next/headers";
import { aiWorkoutGenerationService } from "@/features/suggestions/services/ai-workout-generation.service";
import { generateWorkoutRequestSchema } from "@/features/suggestions/schemas/ai-workout.schemas";
import { rateLimit } from "@/shared/utils/rate-limit";

import { v4 as uuidv4 } from "uuid";

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const auth = getAuth();
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return Response.json(
        {
          success: false,
          error: "Authentication required",
        } satisfies ApiErrorResponse,
        { status: 401 },
      );
    }

    // Rate limiting - 5 requests per minute per user
    const rateLimitResult = await rateLimit({
      key: `ai-workout-generate:${session.user.id}`,
      limit: 5,
      window: 60 * 1000, // 1000 (= 1sec) * 60 = 1 min
    });

    if (!rateLimitResult.success) {
      return Response.json(
        {
          success: false,
          error: "Rate limit exceeded",
        } satisfies ApiErrorResponse,
        { status: 429 },
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = generateWorkoutRequestSchema.safeParse(body);

    if (!validationResult.success) {
      return Response.json(
        {
          success: false,
          error: "Invalid request data",
          details: validationResult.error.issues.map((issue) => issue.message),
        } satisfies ApiErrorResponse,
        { status: 400 },
      );
    }

    // Handle idempotency
    const idempotencyKey = request.headers.get("x-idempotency-key") || uuidv4();

    // Check for existing request with same idempotency key
    const existingResult = await aiWorkoutGenerationService.getByIdempotencyKey(
      idempotencyKey,
      session.user.id,
    );

    if (existingResult) {
      return Response.json(
        {
          success: true,
          data: existingResult,
        } satisfies ApiSuccessResponse<typeof existingResult>,
        { status: 200 },
      );
    }

    // Generate workout using the service with idempotency key
    const result = await aiWorkoutGenerationService.generateWorkout({
      userId: session.user.id,
      request: validationResult.data,
      idempotencyKey,
    });

    return Response.json(
      {
        success: true,
        data: result,
      } satisfies ApiSuccessResponse<typeof result>,
      { status: 200 },
    );
  } catch (error) {
    console.error("AI workout generation error:", error);

    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes("RATE_LIMIT")) {
        return Response.json(
          {
            success: false,
            error: "Too many requests. Please try again later.",
          } satisfies ApiErrorResponse,
          { status: 429 },
        );
      }

      if (error.message.includes("AI_SERVICE_ERROR")) {
        return Response.json(
          {
            success: false,
            error: "AI service temporarily unavailable. Please try again.",
          } satisfies ApiErrorResponse,
          { status: 503 },
        );
      }
    }

    return Response.json(
      {
        success: false,
        error: "An unexpected error occurred",
      } satisfies ApiErrorResponse,
      { status: 500 },
    );
  }
}
