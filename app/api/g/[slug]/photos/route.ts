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
    const event = await db.event.findUnique({
      where: { slug },
      select: { id: true, status: true, settings: true },
    });

    if (!event) {
      return Errors.EVENT_NOT_FOUND() as any;
    }

    const isGuest = !req.cookies.get("token")?.value;

    const where = {
      eventId: event.id,
      ...(isGuest ? { status: "approved" as const } : { status: { not: "deleted" as const } }),
    };

    const photos = await db.photo.findMany({
      where,
      orderBy: { uploadedAt: "desc" },
      take: 100,
    });

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
    const event = await db.event.findUnique({
      where: { slug },
      select: { id: true, status: true, settings: true },
    });

    if (!event) {
      return Errors.EVENT_NOT_FOUND() as any;
    }

    if (event.status === "ended") {
      return Errors.EVENT_ENDED() as any;
    }

    const body = await req.json();
    const data = uploadPhotoSchema.parse(body);

    const settings = event.settings as Record<string, unknown>;
    const autoApprove = settings.autoApprove === true;

    const photo = await db.photo.create({
      data: {
        eventId: event.id,
        fileKey: data.fileKey,
        fileUrl: data.fileUrl,
        fileProvider: data.fileProvider,
        thumbnailUrl: data.thumbnailUrl,
        guestName: data.guestName,
        guestIp: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown",
        message: data.message,
        status: autoApprove ? "approved" : "pending",
        metadata: data.metadata ?? {},
      },
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