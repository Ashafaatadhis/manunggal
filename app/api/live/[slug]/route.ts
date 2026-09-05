import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { successResponse, handleApiError, Errors } from "@/lib/errors";
import { toPhoto } from "@/lib/mappers";
import { readSlideshowConfig } from "@/lib/slideshow";
import type { SlideshowConfig } from "@/lib/types";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const event = await db.event.findUnique({
      where: { slug },
      select: { id: true, slug: true, title: true, status: true, settings: true },
    });

    if (!event) {
      return Errors.EVENT_NOT_FOUND() as any;
    }
    if (event.status === "draft") {
      return Errors.EVENT_NOT_ACTIVE() as any;
    }

    const rows = await db.photo.findMany({
      where: { eventId: event.id, status: "approved" },
      orderBy: { uploadedAt: "desc" },
      take: 500,
    });

    const slideshowConfig: SlideshowConfig = readSlideshowConfig(event.settings);

    return successResponse({
      eventId: event.id,
      slug: event.slug,
      title: event.title,
      photos: rows.map(toPhoto),
      slideshowConfig,
    });
  } catch (error) {
    return handleApiError(error, { route: "live/[slug]" });
  }
}
