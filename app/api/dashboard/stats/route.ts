import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { successResponse, handleApiError } from "@/lib/errors";

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth();

    const [totalEvents, activeEvents, totalPhotos, pendingPhotos] =
      await Promise.all([
        db.event.count({
          where: { hostId: session.userId },
        }),
        db.event.count({
          where: {
            hostId: session.userId,
            status: { in: ["active", "live"] },
          },
        }),
        db.photo.count({
          where: {
            event: { hostId: session.userId },
          },
        }),
        db.photo.count({
          where: {
            event: { hostId: session.userId },
            status: "pending",
          },
        }),
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
