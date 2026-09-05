import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { successResponse, handleApiError, Errors } from "@/lib/errors";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  try {
    const event = await db.event.findUnique({
      where: { slug },
      select: {
        id: true,
        title: true,
        slug: true,
        eventType: true,
        date: true,
        startTime: true,
        endTime: true,
        venue: true,
        status: true,
        branding: true,
      },
    });

    if (!event) {
      return Errors.EVENT_NOT_FOUND() as any;
    }

    if (event.status === "draft") {
      return Errors.EVENT_NOT_ACTIVE() as any;
    }

    return successResponse(event);
  } catch (error) {
    return handleApiError(error, { route: "g/[slug]", slug });
  }
}
