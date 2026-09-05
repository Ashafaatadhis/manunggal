import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { successResponse, handleApiError } from "@/lib/errors";

export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    const where = {
      event: {
        hostId: session.userId,
      },
      ...(status ? { status: status as any } : {}),
    };

    const photos = await db.photo.findMany({
      where,
      include: {
        event: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
      },
      orderBy: { uploadedAt: "desc" },
      take: 100,
    });

    return successResponse(photos);
  } catch (error) {
    return handleApiError(error, { route: "photos/list" });
  }
}
