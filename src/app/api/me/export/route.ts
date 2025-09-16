import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/shared/config/auth/auth";
import { db } from "@/shared/db/database";
import { dataExports } from "@/shared/db/schema/app-schema";
import { eq } from "drizzle-orm";
import { dataExportSchema } from "@/features/settings/types";
import type { DataExport, DataExportJob } from "@/features/settings/types";

type ApiSuccessResponse<T> = {
  success: true;
  data: T;
  message?: string;
};

type ApiErrorResponse = {
  success: false;
  error: string;
  details?: string;
};

export async function GET(request: NextRequest) {
  try {
    // Get the session from better-auth
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
          details: "Please sign in to access this resource",
        } satisfies ApiErrorResponse,
        { status: 401 },
      );
    }

    // Get all export jobs for the user
    const exportJobs = await db
      .select()
      .from(dataExports)
      .where(eq(dataExports.userId, session.user.id))
      .orderBy(dataExports.createdAt);

    const response: ApiSuccessResponse<DataExportJob[]> = {
      success: true,
      data: exportJobs.map(job => ({
        id: job.id,
        format: job.format as "csv" | "json",
        status: job.status as "pending" | "processing" | "complete" | "error",
        downloadUrl: job.downloadUrl || undefined,
        error: job.error || undefined,
        createdAt: job.createdAt.toISOString(),
        updatedAt: job.updatedAt.toISOString(),
      })),
      message: "Export jobs retrieved successfully",
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Error in /api/me/export GET:", error);

    const errorResponse: ApiErrorResponse = {
      success: false,
      error: "Internal Server Error",
      details:
        error instanceof Error ? error.message : "An unexpected error occurred",
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get the session from better-auth
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
          details: "Please sign in to access this resource",
        } satisfies ApiErrorResponse,
        { status: 401 },
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = dataExportSchema.parse(body);

    // Check if user has any pending or processing exports
    const [activeExport] = await db
      .select()
      .from(dataExports)
      .where(
        eq(dataExports.userId, session.user.id)
      )
      .limit(1);

    if (activeExport && (activeExport.status === "pending" || activeExport.status === "processing")) {
      return NextResponse.json(
        {
          success: false,
          error: "Conflict",
          details: "You already have an active export job. Please wait for it to complete.",
        } satisfies ApiErrorResponse,
        { status: 409 },
      );
    }

    // Create new export job
    const [newExportJob] = await db
      .insert(dataExports)
      .values({
        userId: session.user.id,
        format: validatedData.format,
        status: "pending",
      })
      .returning();

    // TODO: In a real implementation, you would trigger a background job here
    // to process the export. For now, we'll just create the job record.
    // Example: await exportQueue.add('processExport', { jobId: newExportJob.id });

    const responseData: DataExportJob = {
      id: newExportJob.id,
      format: newExportJob.format as "csv" | "json",
      status: newExportJob.status as "pending" | "processing" | "complete" | "error",
      downloadUrl: newExportJob.downloadUrl || undefined,
      error: newExportJob.error || undefined,
      createdAt: newExportJob.createdAt.toISOString(),
      updatedAt: newExportJob.updatedAt.toISOString(),
    };

    const response: ApiSuccessResponse<DataExportJob> = {
      success: true,
      data: responseData,
      message: "Export job created successfully. You will be notified when it's ready.",
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error("Error in /api/me/export POST:", error);

    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        {
          success: false,
          error: "Validation Error",
          details: error.message,
        } satisfies ApiErrorResponse,
        { status: 400 },
      );
    }

    const errorResponse: ApiErrorResponse = {
      success: false,
      error: "Internal Server Error",
      details:
        error instanceof Error ? error.message : "An unexpected error occurred",
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}