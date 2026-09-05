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

    authLogger.loginAttempt(data.email);

    const user = await db.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      authLogger.loginFailed(data.email, "user_not_found");
      return Errors.VALIDATION("Email atau password salah") as any;
    }

    const isValidPassword = await compare(data.password, user.password);

    if (!isValidPassword) {
      authLogger.loginFailed(data.email, "invalid_password");
      return Errors.VALIDATION("Email atau password salah") as any;
    }

    const token = await signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    authLogger.loginSuccess(user.id);

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
