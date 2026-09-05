import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { createEventSchema } from "@/lib/validations";
import { successResponse, handleApiError, Errors } from "@/lib/errors";
import { eventLogger } from "@/lib/logger";

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth();
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "50");

    const events = await db.event.findMany({
      where: { hostId: session.userId },
      include: {
        _count: {
          select: { photos: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

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
    const existingEvent = await db.event.findUnique({
      where: { slug: data.slug },
    });

    if (existingEvent) {
      return Errors.CONFLICT("Slug sudah digunakan") as any;
    }

    const event = await db.event.create({
      data: {
        hostId: session.userId,
        title: data.title,
        slug: data.slug,
        eventType: data.eventType,
        description: data.description,
        date: data.date,
        startTime: new Date(`1970-01-01T${data.startTime}`),
        endTime: new Date(`1970-01-01T${data.endTime}`),
        venue: data.venue,
        status: "draft",
      },
    });

    eventLogger.info({ eventId: event.id, userId: session.userId }, "Event created");

    return successResponse(event, 201);
  } catch (error) {
    return handleApiError(error, { route: "events/create" });
  }
}
