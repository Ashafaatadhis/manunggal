import { NextRequest } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { successResponse, handleApiError, Errors } from "@/lib/errors";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();

    if (!session) {
      return handleApiError(Errors.UNAUTHORIZED());
    }

    const user = await db.orm.public.User.where((u) => u.id.eq(session.userId))
      .select("id", "email", "name", "role", "createdAt")
      .first();

    if (!user) {
      return handleApiError(Errors.NOT_FOUND("User"));
    }

    return successResponse(user);
  } catch (error) {
    return handleApiError(error, { route: "auth/me" });
  }
}
