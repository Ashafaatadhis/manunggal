import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { uploadPhotoSchema } from "@/lib/validations";
import { publishPhoto } from "@/lib/redis";
import { successResponse, handleApiError, Errors } from "@/lib/errors";
import { photoLogger } from "@/lib/logger";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const event = await db.orm.public.Event.where((e) => e.slug.eq(slug))
      .select("id", "status", "settings")
      .first();

    if (!event) {
      return handleApiError(Errors.EVENT_NOT_FOUND());
    }

    const isGuest = !req.cookies.get("token")?.value;

    let photoQuery = db.orm.public.Photo.where((p) => p.eventId.eq(event.id));
    if (isGuest) {
      photoQuery = photoQuery.where((p) => p.status.eq("approved"));
    } else {
      photoQuery = photoQuery.where((p) => p.status.neq("deleted"));
    }

    const photos = await photoQuery
      .orderBy((p) => p.uploadedAt.desc())
      .limit(100)
      .all();

    return successResponse(photos);
  } catch (error) {
    return handleApiError(error, { route: "g/photos/list" });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const event = await db.orm.public.Event.where((e) => e.slug.eq(slug))
      .select("id", "status", "settings")
      .first();

    if (!event) {
      return handleApiError(Errors.EVENT_NOT_FOUND());
    }

    if (event.status === "ended") {
      return handleApiError(Errors.EVENT_ENDED());
    }

    if (event.status === "draft") {
      return handleApiError(Errors.EVENT_NOT_ACTIVE());
    }

    const body = await req.json();
    const data = uploadPhotoSchema.parse(body);

    const settings = event.settings as Record<string, unknown>;
    const autoApprove = settings.autoApprove === true;

    const photo = await db.orm.public.Photo.create({
      eventId: event.id,
      fileKey: data.fileKey,
      fileUrl: data.fileUrl,
      fileProvider: data.fileProvider,
      thumbnailUrl: data.thumbnailUrl,
      guestName: data.guestName,
      guestIp:
        req.headers.get("x-forwarded-for") ||
        req.headers.get("x-real-ip") ||
        "unknown",
      message: data.message,
      status: autoApprove ? "approved" : "pending",
      metadata: (data.metadata ?? {}) as never,
    });

    photoLogger.info(
      { photoId: photo.id, eventId: event.id, guestName: data.guestName },
      "Photo uploaded"
    );

    if (autoApprove) {
      await publishPhoto(event.id, photo);
    }

    return successResponse(photo, 201);
  } catch (error) {
    photoLogger.error({ err: error }, "Photo upload failed");
    return handleApiError(error, { route: "g/photos/upload" });
  }
}
