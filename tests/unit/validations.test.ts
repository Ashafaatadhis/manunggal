import { describe, it, expect } from "vitest";
import {
  registerSchema,
  loginSchema,
  createEventSchema,
  uploadPhotoSchema,
  slideshowConfigSchema,
  eventBrandingSchema,
  eventStatusSchema,
  eventPatchSchema,
} from "@/lib/validations";

describe("registerSchema", () => {
  it("should validate correct registration data", () => {
    const result = registerSchema.safeParse({
      email: "test@example.com",
      name: "John",
      password: "123456",
    });
    expect(result.success).toBe(true);
  });

  it("should reject invalid email", () => {
    const result = registerSchema.safeParse({
      email: "invalid-email",
      name: "John",
      password: "123456",
    });
    expect(result.success).toBe(false);
  });

  it("should reject short password", () => {
    const result = registerSchema.safeParse({
      email: "test@example.com",
      name: "John",
      password: "123",
    });
    expect(result.success).toBe(false);
  });

  it("should reject short name", () => {
    const result = registerSchema.safeParse({
      email: "test@example.com",
      name: "J",
      password: "123456",
    });
    expect(result.success).toBe(false);
  });
});

describe("loginSchema", () => {
  it("should validate correct login data", () => {
    const result = loginSchema.safeParse({
      email: "test@example.com",
      password: "123456",
    });
    expect(result.success).toBe(true);
  });

  it("should reject empty password", () => {
    const result = loginSchema.safeParse({
      email: "test@example.com",
      password: "",
    });
    expect(result.success).toBe(false);
  });
});

describe("createEventSchema", () => {
  it("should validate correct event data", () => {
    const result = createEventSchema.safeParse({
      title: "Wedding Party",
      slug: "wedding-party",
      eventType: "wedding",
      date: "2024-12-25",
      startTime: "18:00",
      endTime: "22:00",
    });
    expect(result.success).toBe(true);
  });

  it("should reject invalid slug format", () => {
    const result = createEventSchema.safeParse({
      title: "Wedding Party",
      slug: "Wedding Party!",
      eventType: "wedding",
      date: "2024-12-25",
      startTime: "18:00",
      endTime: "22:00",
    });
    expect(result.success).toBe(false);
  });

  it("should reject invalid event type", () => {
    const result = createEventSchema.safeParse({
      title: "Wedding Party",
      slug: "wedding-party",
      eventType: "invalid",
      date: "2024-12-25",
      startTime: "18:00",
      endTime: "22:00",
    });
    expect(result.success).toBe(false);
  });
});

describe("uploadPhotoSchema", () => {
  it("should validate correct photo data", () => {
    const result = uploadPhotoSchema.safeParse({
      fileKey: "abc123",
      fileUrl: "https://example.com/photo.jpg",
      thumbnailUrl: "https://example.com/thumb.jpg",
    });
    expect(result.success).toBe(true);
  });

  it("should reject invalid URL", () => {
    const result = uploadPhotoSchema.safeParse({
      fileKey: "abc123",
      fileUrl: "not-a-url",
      thumbnailUrl: "https://example.com/thumb.jpg",
    });
    expect(result.success).toBe(false);
  });

  it("should reject message over 500 characters", () => {
    const result = uploadPhotoSchema.safeParse({
      fileKey: "abc123",
      fileUrl: "https://example.com/photo.jpg",
      thumbnailUrl: "https://example.com/thumb.jpg",
      message: "a".repeat(501),
    });
    expect(result.success).toBe(false);
  });
});

describe("Slideshow validation", () => {
  it("should accept a valid config", () => {
    const result = slideshowConfigSchema.safeParse({
      intervalSec: 7,
      transition: "zoom",
      showMessages: false,
    });
    expect(result.success).toBe(true);
  });

  it("should reject interval below 3", () => {
    const result = slideshowConfigSchema.safeParse({
      intervalSec: 2,
      transition: "fade",
    });
    expect(result.success).toBe(false);
  });

  it("should reject interval above 10", () => {
    const result = slideshowConfigSchema.safeParse({
      intervalSec: 11,
      transition: "fade",
    });
    expect(result.success).toBe(false);
  });
});

describe("Event branding validation", () => {
  it("accepts QR customization", () => {
    expect(eventBrandingSchema.safeParse({
      branding: { qr: { colorPreset: "forest", logoUrl: "https://example.com/logo.png" } },
    }).success).toBe(true);
  });

  it("rejects invalid QR logo URLs", () => {
    expect(eventBrandingSchema.safeParse({
      branding: { qr: { colorPreset: "ink", logoUrl: "not-a-url" } },
    }).success).toBe(false);
  });
});

describe("Event status validation", () => {
  it("accepts activation and ending statuses", () => {
    expect(eventStatusSchema.safeParse({ status: "active" }).success).toBe(true);
    expect(eventStatusSchema.safeParse({ status: "ended" }).success).toBe(true);
  });

  it("rejects unsupported status transitions", () => {
    expect(eventStatusSchema.safeParse({ status: "live" }).success).toBe(false);
  });
});

describe("Event patch validation", () => {
  it("rejects mass-assignment fields", () => {
    expect(eventPatchSchema.safeParse({ title: "Changed" }).success).toBe(false);
    expect(eventPatchSchema.safeParse({ status: "active", role: "admin" }).success).toBe(false);
  });
});
