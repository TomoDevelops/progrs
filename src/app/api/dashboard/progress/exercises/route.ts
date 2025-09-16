import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/shared/config/auth/auth";
import { headers } from "next/headers";
import { progressRepository } from "../repository/progress.repository";
import { z } from "zod";

const exercisesQuerySchema = z.object({
  type: z.enum(["favorites", "all"]).default("favorites"),
  search: z.string().optional(),
  offset: z.coerce.number().min(0).default(0),
  limit: z.coerce.number().min(1).max(50).default(20),
});

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const { searchParams } = new URL(request.url);
    const queryResult = exercisesQuerySchema.safeParse({
      type: searchParams.get("type") || "favorites",
      search: searchParams.get("search") || undefined,
      offset: searchParams.get("offset") || "0",
      limit: searchParams.get("limit") || "20",
    });

    if (!queryResult.success) {
      return NextResponse.json(
        { success: false, error: "Invalid query parameters" },
        { status: 400 },
      );
    }

    const { type, search, offset, limit } = queryResult.data;

    if (type === "favorites") {
      const favorites = await progressRepository.getFavoriteExercises(
        session.user.id,
        5,
      );

      return NextResponse.json({
        success: true,
        data: {
          exercises: favorites,
          total: favorites.length,
          hasMore: false,
        },
      });
    } else {
      const result = await progressRepository.getAllUserExercises(
        session.user.id,
        search,
        offset,
        limit,
      );

      return NextResponse.json({
        success: true,
        data: {
          exercises: result.exercises,
          total: result.total,
          hasMore: offset + limit < result.total,
        },
      });
    }
  } catch (error) {
    console.error("Exercises API error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
