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

    const event = await db.event.findUnique({
      where: {
        id: eventId,
        hostId: session.userId,
      },
      include: {
        photos: {
          orderBy: { uploadedAt: "desc" },
        },
      },
    });

    if (!event) {
      return Errors.EVENT_NOT_FOUND() as any;
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

    const event = await db.event.findUnique({
      where: {
        id: eventId,
        hostId: session.userId,
      },
    });

    if (!event) {
      return Errors.EVENT_NOT_FOUND() as any;
    }

    const body = await req.json();

    const updatedEvent = await db.event.update({
      where: { id: eventId },
      data: body,
    });

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

    const event = await db.event.findUnique({
      where: {
        id: eventId,
        hostId: session.userId,
      },
    });

    if (!event) {
      return Errors.EVENT_NOT_FOUND() as any;
    }

    await db.event.delete({
      where: { id: eventId },
    });

    eventLogger.info({ eventId }, "Event deleted");

    return successResponse({ deleted: true });
  } catch (error) {
    return handleApiError(error, { route: "events/delete", eventId });
  }
}
