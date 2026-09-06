import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { slideshowCommandSchema, slideshowConfigSchema } from "@/lib/validations";
import { publishSlideshowCommand } from "@/lib/redis";
import { successResponse, handleApiError, Errors } from "@/lib/errors";
import { eventLogger } from "@/lib/logger";
import { DEFAULT_SLIDESHOW_CONFIG, type SlideshowCommand } from "@/lib/types";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  const { eventId } = await params;
  try {
    const session = await requireAuth();

    const event = await db.orm.public.Event.where((e) => e.id.eq(eventId))
      .where((e) => e.hostId.eq(session.userId))
      .select("id", "settings")
      .first();

    if (!event) {
      return handleApiError(Errors.EVENT_NOT_FOUND());
    }

    const body = await req.json();
    const command = slideshowCommandSchema.parse(body) as SlideshowCommand;

    if (command.type === "config") {
      const config = slideshowConfigSchema.parse(body.config ?? {});
      const raw = (event.settings ?? {}) as Record<string, unknown>;
      const next = {
        ...raw,
        slideshow: {
          ...DEFAULT_SLIDESHOW_CONFIG,
          ...config,
        },
      };
      await db.orm.public.Event.where((e) => e.id.eq(eventId)).update({
        settings: next as never,
      });
    }

    await publishSlideshowCommand(eventId, {
      ...command,
      issuedBy: session.userId,
    });

    eventLogger.info({ eventId, type: command.type }, "Slideshow command published");

    return successResponse({ published: true });
  } catch (error) {
    return handleApiError(error, { route: "events/slideshow/control", eventId });
  }
}