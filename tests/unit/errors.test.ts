import { describe, it, expect } from "vitest";
import {
  AppError,
  handleApiError,
  successResponse,
  errorResponse,
  Errors,
} from "@/lib/errors";

describe("AppError", () => {
  it("should create an error with code, message, and status", () => {
    const error = new AppError("TEST_ERROR", "Test message", 400);

    expect(error.code).toBe("TEST_ERROR");
    expect(error.message).toBe("Test message");
    expect(error.statusCode).toBe(400);
    expect(error.name).toBe("AppError");
  });

  it("should default to 500 status", () => {
    const error = new AppError("TEST_ERROR", "Test message");

    expect(error.statusCode).toBe(500);
  });

  it("should accept context", () => {
    const error = new AppError("TEST_ERROR", "Test message", 400, {
      userId: "123",
    });

    expect(error.context).toEqual({ userId: "123" });
  });
});

describe("handleApiError", () => {
  it("should handle AppError correctly", () => {
    const error = new AppError("TEST_ERROR", "Test message", 400);
    const response = handleApiError(error);

    expect(response.status).toBe(400);
  });

  it("should handle unknown errors as 500", () => {
    const response = handleApiError(new Error("Unknown error"));

    expect(response.status).toBe(500);
  });
});

describe("successResponse", () => {
  it("should return success response with data", () => {
    const data = { id: "123", name: "Test" };
    const response = successResponse(data);

    expect(response.status).toBe(200);
  });

  it("should accept custom status code", () => {
    const response = successResponse({ id: "123" }, 201);

    expect(response.status).toBe(201);
  });
});

describe("errorResponse", () => {
  it("should return error response with code and message", () => {
    const response = errorResponse("TEST_ERROR", "Test message");

    expect(response.status).toBe(400);
  });

  it("should accept custom status code", () => {
    const response = errorResponse("TEST_ERROR", "Test message", 404);

    expect(response.status).toBe(404);
  });
});

describe("Errors", () => {
  it("should create UNAUTHORIZED error", () => {
    const error = Errors.UNAUTHORIZED();

    expect(error.code).toBe("UNAUTHORIZED");
    expect(error.statusCode).toBe(401);
  });

  it("should create FORBIDDEN error", () => {
    const error = Errors.FORBIDDEN();

    expect(error.code).toBe("FORBIDDEN");
    expect(error.statusCode).toBe(403);
  });

  it("should create NOT_FOUND error with resource name", () => {
    const error = Errors.NOT_FOUND("User");

    expect(error.code).toBe("NOT_FOUND");
    expect(error.message).toBe("User tidak ditemukan");
    expect(error.statusCode).toBe(404);
  });

  it("should create VALIDATION error", () => {
    const error = Errors.VALIDATION("Invalid input");

    expect(error.code).toBe("VALIDATION_ERROR");
    expect(error.statusCode).toBe(400);
  });

  it("should create CONFLICT error", () => {
    const error = Errors.CONFLICT("Email already exists");

    expect(error.code).toBe("CONFLICT");
    expect(error.statusCode).toBe(409);
  });

  it("should create EVENT_NOT_FOUND error", () => {
    const error = Errors.EVENT_NOT_FOUND();

    expect(error.code).toBe("EVENT_NOT_FOUND");
    expect(error.statusCode).toBe(404);
  });

  it("should create EVENT_NOT_ACTIVE error", () => {
    const error = Errors.EVENT_NOT_ACTIVE();

    expect(error.code).toBe("EVENT_NOT_ACTIVE");
    expect(error.statusCode).toBe(403);
  });

  it("should create EVENT_ENDED error", () => {
    const error = Errors.EVENT_ENDED();

    expect(error.code).toBe("EVENT_ENDED");
    expect(error.statusCode).toBe(403);
  });

  it("should create PHOTO_NOT_FOUND error", () => {
    const error = Errors.PHOTO_NOT_FOUND();

    expect(error.code).toBe("PHOTO_NOT_FOUND");
    expect(error.statusCode).toBe(404);
  });

  it("should create UPLOAD_FAILED error", () => {
    const error = Errors.UPLOAD_FAILED();

    expect(error.code).toBe("UPLOAD_FAILED");
    expect(error.statusCode).toBe(500);
  });
});
