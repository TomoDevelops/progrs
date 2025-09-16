import { NextRequest, NextResponse } from "next/server";
import { db } from "@/shared/db/database";
import { exercises } from "@/shared/db/schema/app-schema";
import { ilike, or, eq, and } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    const whereConditions = [eq(exercises.isPublic, true)];

    // Add search filter if provided
    if (search) {
      whereConditions.push(
        or(
          ilike(exercises.name, `%${search}%`),
          ilike(exercises.muscleGroup, `%${search}%`),
          ilike(exercises.equipment, `%${search}%`),
        )!,
      );
    }

    const results = await db
      .select()
      .from(exercises)
      .where(
        whereConditions.length > 1
          ? and(...whereConditions)
          : whereConditions[0],
      )
      .limit(limit)
      .offset(offset);

    return NextResponse.json({
      success: true,
      data: results,
      pagination: {
        limit,
        offset,
        total: results.length,
      },
    });
  } catch (error) {
    console.error("Error fetching exercises:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 },
    );
  }
}
