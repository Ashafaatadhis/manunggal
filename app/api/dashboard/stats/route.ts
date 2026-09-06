import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { successResponse, handleApiError } from "@/lib/errors";

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth();

    const hostEvents = await db.orm.public.Event.select("id")
      .where((e) => e.hostId.eq(session.userId))
      .all();
    const eventIds = hostEvents.map((e) => e.id);

    const [totalEvents, activeEvents, totalPhotos, pendingPhotos] =
      await Promise.all([
        db.orm.public.Event.where((e) => e.hostId.eq(session.userId)).count(),
        db.orm.public.Event.where((e) => e.hostId.eq(session.userId))
          .where((e) => e.status.in(["active", "live"]))
          .count(),
        db.orm.public.Photo.where((p) => p.eventId.in(eventIds)).count(),
        db.orm.public.Photo.where((p) => p.eventId.in(eventIds))
          .where((p) => p.status.eq("pending"))
          .count(),
      ]);

    return successResponse({
      totalEvents,
      activeEvents,
      totalPhotos,
      pendingPhotos,
    });
  } catch (error) {
    return handleApiError(error, { route: "dashboard/stats" });
  }
}
