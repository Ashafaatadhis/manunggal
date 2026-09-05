import { NextResponse } from "next/server";
import logger from "./logger";

export class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 500,
    public context?: Record<string, unknown>
  ) {
    super(message);
    this.name = "AppError";
  }
}

export function handleApiError(
  error: unknown,
  context?: Record<string, unknown>
): NextResponse {
  if (error instanceof AppError) {
    logger.warn(error.message, {
      code: error.code,
      statusCode: error.statusCode,
      ...context,
      ...error.context,
    });

    return NextResponse.json(
      {
        success: false,
        error: { code: error.code, message: error.message },
      },
      { status: error.statusCode }
    );
  }

  logger.error("Unexpected error", context, error as Error);

  return NextResponse.json(
    {
      success: false,
      error: { code: "INTERNAL_ERROR", message: "Terjadi kesalahan" },
    },
    { status: 500 }
  );
}

export function successResponse<T>(data: T, status = 200): NextResponse {
  return NextResponse.json({ success: true, data }, { status });
}

export function errorResponse(
  code: string,
  message: string,
  status = 400
): NextResponse {
  return NextResponse.json(
    { success: false, error: { code, message } },
    { status }
  );
}

// Common errors
export const Errors = {
  UNAUTHORIZED: () => new AppError("UNAUTHORIZED", "Tidak terautentikasi", 401),
  FORBIDDEN: () => new AppError("FORBIDDEN", "Tidak memiliki akses", 403),
  NOT_FOUND: (resource: string) =>
    new AppError("NOT_FOUND", `${resource} tidak ditemukan`, 404),
  VALIDATION: (message: string) =>
    new AppError("VALIDATION_ERROR", message, 400),
  CONFLICT: (message: string) =>
    new AppError("CONFLICT", message, 409),
  EVENT_NOT_FOUND: () =>
    new AppError("EVENT_NOT_FOUND", "Event tidak ditemukan", 404),
  EVENT_NOT_ACTIVE: () =>
    new AppError("EVENT_NOT_ACTIVE", "Event belum aktif", 403),
  EVENT_ENDED: () =>
    new AppError("EVENT_ENDED", "Acara sudah berakhir", 403),
  PHOTO_NOT_FOUND: () =>
    new AppError("PHOTO_NOT_FOUND", "Foto tidak ditemukan", 404),
  UPLOAD_FAILED: () =>
    new AppError("UPLOAD_FAILED", "Gagal mengunggah file", 500),
};
