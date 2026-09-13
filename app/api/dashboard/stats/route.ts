import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { successResponse, handleApiError } from "@/lib/errors";

export async function GET() {
  try {
    const session = await requireAuth();

    const hostEvents = await db.orm.public.Event.select("id")
      .where((e) => e.hostId.eq(session.userId))
      .all();
    const eventIds = hostEvents.map((e) => e.id);

    const [totalEventsResult, activeEventsResult] = await Promise.all([
      db.orm.public.Event.where((e) => e.hostId.eq(session.userId)).aggregate((aggregate) => ({
        count: aggregate.count(),
      })),
      db.orm.public.Event.where((e) => e.hostId.eq(session.userId))
        .where((e) => e.status.in(["active", "live"]))
        .aggregate((aggregate) => ({
          count: aggregate.count(),
        })),
    ]);

    const [totalPhotos, pendingPhotos] = eventIds.length
      ? await Promise.all([
          db.orm.public.Photo.where((p) => p.eventId.in(eventIds)).aggregate((aggregate) => ({
            count: aggregate.count(),
          })),
          db.orm.public.Photo.where((p) => p.eventId.in(eventIds))
            .where((p) => p.status.eq("pending"))
            .aggregate((aggregate) => ({
              count: aggregate.count(),
            })),
        ])
      : [{ count: 0 }, { count: 0 }];

    return successResponse({
      totalEvents: totalEventsResult.count,
      activeEvents: activeEventsResult.count,
      totalPhotos: totalPhotos.count,
      pendingPhotos: pendingPhotos.count,
    });
  } catch (error) {
    return handleApiError(error, { route: "dashboard/stats" });
  }
}
