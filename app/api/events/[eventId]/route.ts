import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { successResponse, handleApiError, Errors } from "@/lib/errors";
import { eventLogger } from "@/lib/logger";
import {
  eventBrandingSchema,
  eventPatchSchema,
  eventSettingsSchema,
  eventStatusSchema,
} from "@/lib/validations";
import { canChangeEventStatus } from "@/lib/event-lifecycle";

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

    const body = eventPatchSchema.parse(await req.json());

    if (body && typeof body === "object" && "status" in body) {
      const data = eventStatusSchema.parse(body);
      if (!canChangeEventStatus(event.status, data.status)) {
        return handleApiError(
          Errors.CONFLICT(`Status event tidak dapat diubah dari ${event.status} ke ${data.status}`),
        );
      }

      const updatedEvent = await db.orm.public.Event.where((e) =>
        e.id.eq(eventId)
      ).update({ status: data.status });

      if (!updatedEvent) return handleApiError(Errors.EVENT_NOT_FOUND());
      eventLogger.info({ eventId: updatedEvent.id, status: data.status }, "Event status updated");
      return successResponse(updatedEvent);
    }

    if (body && typeof body === "object" && "branding" in body) {
      const data = eventBrandingSchema.parse(body);
      const currentBranding = (event.branding ?? {}) as Record<string, unknown>;
      const branding = {
        ...currentBranding,
        ...data.branding,
        ...(data.branding.qr
          ? {
              qr: {
                ...((currentBranding.qr ?? {}) as Record<string, unknown>),
                ...data.branding.qr,
              },
            }
          : {}),
      };

      const updatedEvent = await db.orm.public.Event.where((e) =>
        e.id.eq(eventId)
      ).update({ branding: branding as never });

      if (!updatedEvent) {
        return handleApiError(Errors.EVENT_NOT_FOUND());
      }

      eventLogger.info({ eventId: updatedEvent.id }, "Event branding updated");
      return successResponse(updatedEvent);
    }

    if (body && typeof body === "object" && "settings" in body) {
      const data = eventSettingsSchema.parse(body);
      const settings = {
        ...((event.settings ?? {}) as Record<string, unknown>),
        ...data.settings,
      };
      const updatedEvent = await db.orm.public.Event.where((e) =>
        e.id.eq(eventId)
      ).update({ settings: settings as never });

      if (!updatedEvent) {
        return handleApiError(Errors.EVENT_NOT_FOUND());
      }

      eventLogger.info({ eventId: updatedEvent.id }, "Event settings updated");
      return successResponse(updatedEvent);
    }

    return handleApiError(Errors.VALIDATION("Payload event tidak valid"));
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
