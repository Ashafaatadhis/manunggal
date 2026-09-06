import { NextRequest } from "next/server";
import { compare } from "bcryptjs";
import { db } from "@/lib/db";
import { loginSchema } from "@/lib/validations";
import { signToken } from "@/lib/auth";
import { successResponse, handleApiError, Errors } from "@/lib/errors";
import { authLogger } from "@/lib/logger";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = loginSchema.parse(body);

    authLogger.info({ email: data.email }, "Login attempt");

    const user = await db.orm.public.User.where((u) =>
      u.email.eq(data.email)
    ).first();

    if (!user) {
      authLogger.warn({ email: data.email, reason: "user_not_found" }, "Login failed");
      return handleApiError(Errors.VALIDATION("Email atau password salah"));
    }

    const isValidPassword = await compare(data.password, user.password);

    if (!isValidPassword) {
      authLogger.warn({ email: data.email, reason: "invalid_password" }, "Login failed");
      return handleApiError(Errors.VALIDATION("Email atau password salah"));
    }

    const token = await signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    authLogger.info({ userId: user.id }, "Login success");

    const response = successResponse({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (error) {
    return handleApiError(error, { route: "login" });
  }
}
