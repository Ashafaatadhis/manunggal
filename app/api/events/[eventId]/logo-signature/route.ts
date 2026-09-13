import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { generateUploadSignature } from "@/lib/cloudinary";
import { Errors, handleApiError, successResponse } from "@/lib/errors";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ eventId: string }> },
) {
  const { eventId } = await params;

  try {
    const session = await requireAuth();
    const event = await db.orm.public.Event.where((eventQuery) =>
      eventQuery.id.eq(eventId),
    ).where((eventQuery) => eventQuery.hostId.eq(session.userId)).first();

    if (!event) return handleApiError(Errors.EVENT_NOT_FOUND());

    return successResponse(generateUploadSignature(event.id));
  } catch (error) {
    return handleApiError(error, { route: "events/logo-signature", eventId });
  }
}
