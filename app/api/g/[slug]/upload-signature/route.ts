import { NextRequest } from "next/server";
import { generateUploadSignature } from "@/lib/cloudinary";
import { db } from "@/lib/db";
import { successResponse, handleApiError, Errors } from "@/lib/errors";
import { uploadLogger } from "@/lib/logger";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const event = await db.orm.public.Event.where((e) => e.slug.eq(slug))
      .select("id", "status")
      .first();

    if (!event) {
      return handleApiError(Errors.EVENT_NOT_FOUND());
    }

    if (event.status === "ended") {
      return handleApiError(Errors.EVENT_ENDED());
    }

    const signature = generateUploadSignature(event.id);
    uploadLogger.info({ eventId: event.id }, "Upload signature generated");

    return successResponse(signature);
  } catch (error) {
    uploadLogger.error({ err: error }, "Upload signature failed");
    return handleApiError(error, { route: "g/upload-signature" });
  }
}
