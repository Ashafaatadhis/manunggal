import { NextRequest } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { successResponse, handleApiError, Errors } from "@/lib/errors";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();

    if (!session) {
      return Errors.UNAUTHORIZED() as any;
    }

    const user = await db.user.findUnique({
      where: { id: session.userId },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    });

    if (!user) {
      return Errors.NOT_FOUND("User") as any;
    }

    return successResponse(user);
  } catch (error) {
    return handleApiError(error, { route: "auth/me" });
  }
}
