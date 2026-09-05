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

    const event = await db.event.findUnique({
      where: { id: eventId, hostId: session.userId },
      select: { id: true, settings: true },
    });

    if (!event) {
      return Errors.EVENT_NOT_FOUND() as any;
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
      await db.event.update({
        where: { id: eventId },
        data: { settings: next },
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