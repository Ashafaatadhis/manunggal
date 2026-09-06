import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { successResponse, handleApiError, Errors } from "@/lib/errors";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  try {
    const event = await db.orm.public.Event.where((e) => e.slug.eq(slug))
      .select(
        "id",
        "title",
        "slug",
        "eventType",
        "date",
        "startTime",
        "endTime",
        "venue",
        "status",
        "branding"
      )
      .first();

    if (!event) {
      return handleApiError(Errors.EVENT_NOT_FOUND());
    }

    if (event.status === "draft") {
      return handleApiError(Errors.EVENT_NOT_ACTIVE());
    }

    return successResponse(event);
  } catch (error) {
    return handleApiError(error, { route: "g/[slug]", slug });
  }
}
