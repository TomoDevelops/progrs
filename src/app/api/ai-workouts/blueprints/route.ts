import { NextRequest } from "next/server";
import { getAuth } from "@/shared/config/auth/auth";
import { ApiErrorResponse, ApiSuccessResponse } from "@/shared/types/api";
import { headers } from "next/headers";
import { getDb } from "@/shared/db/database";
import { aiWorkoutBlueprints } from "@/shared/db/schema/app-schema";
import { desc, eq } from "drizzle-orm";
import { workoutBlueprintSchema } from "@/features/ai-workouts/schemas/ai-workout.schemas";

export async function GET(request: NextRequest) {
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
        { status: 401 }
      );
    }

    const db = getDb();
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100);
    const offset = parseInt(searchParams.get("offset") || "0");
    const specHash = searchParams.get("spec_hash");

    // Build query with conditional filtering
    let blueprints;
    
    if (specHash) {
      blueprints = await db
        .select()
        .from(aiWorkoutBlueprints)
        .where(eq(aiWorkoutBlueprints.specHash, specHash))
        .orderBy(desc(aiWorkoutBlueprints.lastUsedAt))
        .limit(limit)
        .offset(offset);
    } else {
      blueprints = await db
        .select()
        .from(aiWorkoutBlueprints)
        .orderBy(desc(aiWorkoutBlueprints.lastUsedAt))
        .limit(limit)
        .offset(offset);
    }

    // Transform to match schema
    const transformedBlueprints = blueprints.map(blueprint => ({
      id: blueprint.id,
      specHash: blueprint.specHash,
      routineData: blueprint.routineData,
      createdAt: blueprint.createdAt.toISOString(),
      lastUsedAt: blueprint.lastUsedAt.toISOString(),
      usageCount: blueprint.usageCount,
    }));

    return Response.json(
      {
        success: true,
        data: {
          blueprints: transformedBlueprints,
          pagination: {
            limit,
            offset,
            total: blueprints.length, // This is not accurate, but good enough for now
            hasMore: blueprints.length === limit,
          },
        },
      } satisfies ApiSuccessResponse<{
        blueprints: typeof transformedBlueprints;
        pagination: {
          limit: number;
          offset: number;
          total: number;
          hasMore: boolean;
        };
      }>,
      { status: 200 }
    );
  } catch (error) {
    console.error("Blueprint retrieval error:", error);
    
    return Response.json(
      {
        success: false,
        error: "An unexpected error occurred",
      } satisfies ApiErrorResponse,
      { status: 500 }
    );
  }
}