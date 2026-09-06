import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { successResponse, handleApiError, Errors } from "@/lib/errors";
import { eventLogger } from "@/lib/logger";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  const { eventId } = await params;
  try {
    const session = await requireAuth();

    const event = await db.orm.public.Event.where((e) => e.id.eq(eventId))
      .where((e) => e.hostId.eq(session.userId))
      .include("photos", (photos) =>
        photos.orderBy((p) => p.uploadedAt.desc())
      )
      .first();

    if (!event) {
      return handleApiError(Errors.EVENT_NOT_FOUND());
    }

    return successResponse(event);
  } catch (error) {
    return handleApiError(error, { route: "events/detail", eventId });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  const { eventId } = await params;
  try {
    const session = await requireAuth();

    const event = await db.orm.public.Event.where((e) => e.id.eq(eventId))
      .where((e) => e.hostId.eq(session.userId))
      .first();

    if (!event) {
      return handleApiError(Errors.EVENT_NOT_FOUND());
    }

    const body = await req.json();

    const updatedEvent = await db.orm.public.Event.where((e) =>
      e.id.eq(eventId)
    ).update(body);

    if (!updatedEvent) {
      return handleApiError(Errors.EVENT_NOT_FOUND());
    }

    eventLogger.info({ eventId: updatedEvent.id }, "Event updated");

    return successResponse(updatedEvent);
  } catch (error) {
    return handleApiError(error, { route: "events/update", eventId });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  const { eventId } = await params;
  try {
    const session = await requireAuth();

    const event = await db.orm.public.Event.where((e) => e.id.eq(eventId))
      .where((e) => e.hostId.eq(session.userId))
      .first();

    if (!event) {
      return handleApiError(Errors.EVENT_NOT_FOUND());
    }

    await db.orm.public.Event.where((e) => e.id.eq(eventId)).delete();

    eventLogger.info({ eventId }, "Event deleted");

    return successResponse({ deleted: true });
  } catch (error) {
    return handleApiError(error, { route: "events/delete", eventId });
  }
}
