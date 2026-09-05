import { describe, it, expect } from "vitest";
import type {
  User,
  Vendor,
  Event,
  Photo,
  Order,
  ApiResponse,
  EventListItem,
  EventSettings,
  EventBranding,
  PhotoMetadata,
} from "@/lib/types";

describe("Types", () => {
  it("should define User type correctly", () => {
    const user: User = {
      id: "123",
      email: "test@example.com",
      name: "John",
      role: "host",
      createdAt: new Date(),
    };

    expect(user.id).toBe("123");
    expect(user.role).toBe("host");
  });

  it("should define Vendor type correctly", () => {
    const vendor: Vendor = {
      id: "123",
      userId: "user-456",
      companyName: "Test Company",
      subscription: "pro",
      branding: {},
      createdAt: new Date(),
    };

    expect(vendor.companyName).toBe("Test Company");
    expect(vendor.subscription).toBe("pro");
  });

  it("should define Event type correctly", () => {
    const event: Event = {
      id: "123",
      hostId: "user-456",
      title: "Test Event",
      slug: "test-event",
      eventType: "wedding",
      date: new Date(),
      startTime: new Date(),
      endTime: new Date(),
      status: "active",
      settings: {},
      branding: {},
      createdAt: new Date(),
    };

    expect(event.eventType).toBe("wedding");
    expect(event.status).toBe("active");
  });

  it("should define Photo type correctly", () => {
    const photo: Photo = {
      id: "123",
      eventId: "event-456",
      fileKey: "key-789",
      fileUrl: "https://example.com/photo.jpg",
      fileProvider: "cloudinary",
      thumbnailUrl: "https://example.com/thumb.jpg",
      status: "pending",
      metadata: {},
      uploadedAt: new Date(),
    };

    expect(photo.fileProvider).toBe("cloudinary");
    expect(photo.status).toBe("pending");
  });

  it("should define Order type correctly", () => {
    const order: Order = {
      id: "123",
      eventId: "event-456",
      userId: "user-789",
      amount: 150000,
      package: "pro_event",
      status: "pending",
      createdAt: new Date(),
    };

    expect(order.amount).toBe(150000);
    expect(order.package).toBe("pro_event");
  });

  it("should define ApiResponse type correctly", () => {
    const response: ApiResponse<{ id: string }> = {
      success: true,
      data: { id: "123" },
    };

    expect(response.success).toBe(true);
    expect(response.data?.id).toBe("123");
  });

  it("should define EventListItem type correctly", () => {
    const item: EventListItem = {
      id: "123",
      title: "Test Event",
      slug: "test-event",
      eventType: "birthday",
      date: new Date(),
      status: "live",
      _count: { photos: 42 },
    };

    expect(item._count.photos).toBe(42);
  });

  it("should define EventSettings type correctly", () => {
    const settings: EventSettings = {
      moderationEnabled: true,
      maxPhotosPerGuest: 10,
      slideshowInterval: 5,
      slideshowTransition: "fade",
      autoApprove: false,
    };

    expect(settings.moderationEnabled).toBe(true);
    expect(settings.slideshowTransition).toBe("fade");
  });

  it("should define EventBranding type correctly", () => {
    const branding: EventBranding = {
      accentColor: "#D4A574",
      logoUrl: "https://example.com/logo.png",
      template: "elegant",
    };

    expect(branding.accentColor).toBe("#D4A574");
  });

  it("should define PhotoMetadata type correctly", () => {
    const metadata: PhotoMetadata = {
      width: 1920,
      height: 1080,
      format: "jpg",
      sizeBytes: 2450000,
    };

    expect(metadata.width).toBe(1920);
    expect(metadata.format).toBe("jpg");
  });
});
