import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { publishModeration } from "@/lib/redis";
import { requireAuth } from "@/lib/auth";
import { successResponse, handleApiError, Errors } from "@/lib/errors";
import { photoLogger } from "@/lib/logger";
import { toInstant } from "@/lib/temporal";
import { z } from "zod";

const moderationSchema = z.object({
  status: z.enum(["approved", "hidden", "deleted"]),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await requireAuth();

    const photo = await db.orm.public.Photo.where((p) => p.id.eq(id))
      .select("id", "eventId", "status")
      .first();

    if (!photo) {
      return handleApiError(Errors.PHOTO_NOT_FOUND());
    }

    const body = await req.json();
    const data = moderationSchema.parse(body);

    const updatedPhoto = await db.orm.public.Photo.where((p) => p.id.eq(id)).update({
      status: data.status,
      moderatedAt: toInstant(new Date()),
    });

    photoLogger.info(
      { photoId: photo.id, status: data.status, userId: session.userId },
      "Photo moderation action"
    );
    await publishModeration(photo.eventId, photo.id, data.status);

    return successResponse(updatedPhoto);
  } catch (error) {
    return handleApiError(error, { route: "photos/moderation", photoId: id });
  }
}
