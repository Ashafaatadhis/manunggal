import { describe, it, expect, vi, beforeEach } from "vitest";
import { generateUploadSignature, getThumbnailUrl } from "@/lib/cloudinary";

// Mock cloudinary
vi.mock("cloudinary", () => ({
  v2: {
    config: vi.fn(),
    utils: {
      api_sign_request: vi.fn().mockReturnValue("mock-signature-123"),
    },
    uploader: {
      destroy: vi.fn().mockResolvedValue({ result: "ok" }),
    },
  },
}));

describe("Cloudinary", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.CLOUDINARY_API_KEY = "test-api-key";
    process.env.CLOUDINARY_API_SECRET = "test-api-secret";
    process.env.CLOUDINARY_CLOUD_NAME = "test-cloud";
  });

  describe("generateUploadSignature", () => {
    it("should generate signature with timestamp and folder", () => {
      const eventId = "event-123";
      const result = generateUploadSignature(eventId);

      expect(result).toHaveProperty("timestamp");
      expect(result).toHaveProperty("signature", "mock-signature-123");
      expect(result).toHaveProperty("apiKey", "test-api-key");
      expect(result).toHaveProperty("cloudName", "test-cloud");
      expect(result).toHaveProperty("folder", "manunggal/events/event-123");
    });

    it("should use correct folder format", () => {
      const eventId = "my-event-456";
      const result = generateUploadSignature(eventId);

      expect(result.folder).toBe("manunggal/events/my-event-456");
    });
  });

  describe("getThumbnailUrl", () => {
    it("should transform URL to thumbnail with default 300px", () => {
      const url =
        "https://res.cloudinary.com/demo/image/upload/v123/photo.jpg";
      const result = getThumbnailUrl(url);

      expect(result).toContain("w_300,h_300,c_fill,f_auto");
    });

    it("should use custom width", () => {
      const url =
        "https://res.cloudinary.com/demo/image/upload/v123/photo.jpg";
      const result = getThumbnailUrl(url, 500);

      expect(result).toContain("w_500,h_500,c_fill,f_auto");
    });

    it("should preserve the rest of the URL", () => {
      const url =
        "https://res.cloudinary.com/demo/image/upload/v123/photo.jpg";
      const result = getThumbnailUrl(url);

      expect(result).toContain("v123/photo.jpg");
    });
  });
});
