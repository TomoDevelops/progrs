import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/shared/config/auth/auth";
import { headers } from "next/headers";
import { dashboardRepository } from "@/app/api/dashboard/repository/dashboard.repository";
import { z } from "zod";

const personalRecordsQuerySchema = z.object({
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 10)),
  days: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 30)),
});

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const { limit, days } = personalRecordsQuerySchema.parse({
      limit: searchParams.get("limit"),
      days: searchParams.get("days"),
    });

    const personalRecords = await dashboardRepository.getRecentPersonalRecords(
      session.user.id,
      limit,
      days,
    );

    return NextResponse.json({
      success: true,
      data: personalRecords,
    });
  } catch (error) {
    console.error("Error fetching personal records:", error);
    return NextResponse.json(
      { error: "Failed to fetch personal records" },
      { status: 500 },
    );
  }
}
