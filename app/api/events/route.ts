import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { createEventSchema } from "@/lib/validations";
import { successResponse, handleApiError, Errors } from "@/lib/errors";
import { eventLogger } from "@/lib/logger";
import { toInstant } from "@/lib/temporal";

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth();
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "50");

    const events = await db.orm.public.Event.where((e) =>
      e.hostId.eq(session.userId)
    )
      .include("photos", (photos) => photos.count())
      .orderBy((e) => e.createdAt.desc())
      .limit(limit)
      .all();

    return successResponse(events);
  } catch (error) {
    return handleApiError(error, { route: "events/list" });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth();
    const body = await req.json();
    const data = createEventSchema.parse(body);

    // Check if slug is unique
    const existingEvent = await db.orm.public.Event.where((e) =>
      e.slug.eq(data.slug)
    ).first();

    if (existingEvent) {
      return handleApiError(Errors.CONFLICT("Slug sudah digunakan"));
    }

    const event = await db.orm.public.Event.create({
      hostId: session.userId,
      title: data.title,
      slug: data.slug,
      eventType: data.eventType,
      description: data.description,
      date: toInstant(data.date),
      startTime: toInstant(new Date(`1970-01-01T${data.startTime}`)),
      endTime: toInstant(new Date(`1970-01-01T${data.endTime}`)),
      venue: data.venue,
      status: "draft",
    });

    eventLogger.info({ eventId: event.id, userId: session.userId }, "Event created");

    return successResponse(event, 201);
  } catch (error) {
    return handleApiError(error, { route: "events/create" });
  }
}
