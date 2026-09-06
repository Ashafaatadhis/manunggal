import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { successResponse, handleApiError } from "@/lib/errors";

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    // Resolve the host's event ids first, then filter photos by membership.
    const hostEvents = await db.orm.public.Event.select("id")
      .where((e) => e.hostId.eq(session.userId))
      .all();
    const eventIds = hostEvents.map((e) => e.id);

    let photoQuery = db.orm.public.Photo.where((p) => p.eventId.in(eventIds));
    if (status) {
      photoQuery = photoQuery.where((p) => p.status.eq(status as never));
    }
    const photos = await photoQuery
      .include("event", (event) => event.select("id", "title", "slug"))
      .orderBy((p) => p.uploadedAt.desc())
      .limit(100)
      .all();

    return successResponse(photos);
  } catch (error) {
    return handleApiError(error, { route: "photos/list" });
  }
}
