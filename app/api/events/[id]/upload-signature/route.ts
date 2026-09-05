import { NextRequest } from "next/server";
import { generateUploadSignature } from "@/lib/cloudinary";
import { db } from "@/lib/db";
import { successResponse, handleApiError, Errors } from "@/lib/errors";
import { uploadLogger } from "@/lib/logger";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const event = await db.event.findUnique({
      where: { id: params.id },
      select: { id: true, status: true },
    });

    if (!event) {
      return Errors.EVENT_NOT_FOUND() as any;
    }

    if (event.status === "ended") {
      return Errors.EVENT_ENDED() as any;
    }

    const signature = generateUploadSignature(event.id);
    uploadLogger.signatureGenerated(event.id);

    return successResponse(signature);
  } catch (error) {
    uploadLogger.signatureFailed(params.id, error as Error);
    return handleApiError(error, { route: "upload-signature", eventId: params.id });
  }
}
