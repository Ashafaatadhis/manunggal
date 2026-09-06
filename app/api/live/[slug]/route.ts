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
    const event = await db.orm.public.Event.where((e) => e.slug.eq(slug))
      .select("id", "slug", "title", "status", "settings")
      .first();

    if (!event) {
      return handleApiError(Errors.EVENT_NOT_FOUND());
    }
    if (event.status === "draft") {
      return handleApiError(Errors.EVENT_NOT_ACTIVE());
    }

    const rows = await db.orm.public.Photo.where((p) => p.eventId.eq(event.id))
      .where((p) => p.status.eq("approved"))
      .orderBy((p) => p.uploadedAt.desc())
      .limit(500)
      .all();

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
