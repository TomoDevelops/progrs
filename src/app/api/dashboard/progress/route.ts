import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/shared/config/auth/auth";
import { headers } from "next/headers";
import { progressRepository } from "./repository/progress.repository";
import { z } from "zod";

const progressQuerySchema = z.object({
  exerciseId: z.string().optional(),
  timeframe: z.enum(["4W", "8W", "3M", "1Y", "ALL"]).default("8W"),
  metric: z.enum(["weight", "reps", "volume"]).default("weight"),
});

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const queryResult = progressQuerySchema.safeParse({
      exerciseId: searchParams.get("exerciseId") || undefined,
      timeframe: searchParams.get("timeframe") || "8W",
      metric: searchParams.get("metric") || "weight",
    });

    if (!queryResult.success) {
      return NextResponse.json(
        { success: false, error: "Invalid query parameters" },
        { status: 400 }
      );
    }

    const { exerciseId, timeframe, metric } = queryResult.data;

    // If no exerciseId provided, get the most frequent exercise
    const targetExerciseId = exerciseId || 
      await progressRepository.getMostFrequentExercise(session.user.id, timeframe);

    if (!targetExerciseId) {
      return NextResponse.json({
        success: true,
        data: {
          exerciseId: null,
          exerciseName: null,
          data: [],
          metric,
          timeframe,
        },
      });
    }

    const progressData = await progressRepository.getProgressData(
      session.user.id,
      targetExerciseId,
      timeframe,
      metric
    );

    const exerciseInfo = await progressRepository.getExerciseInfo(targetExerciseId);

    return NextResponse.json({
      success: true,
      data: {
        exerciseId: targetExerciseId,
        exerciseName: exerciseInfo?.name || "Unknown Exercise",
        data: progressData,
        metric,
        timeframe,
      },
    });
  } catch (error) {
    console.error("Progress API error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}