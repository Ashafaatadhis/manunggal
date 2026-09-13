import { describe, expect, it } from "vitest";
import { toPhoto } from "@/lib/mappers";

describe("toPhoto", () => {
  it("converts temporal date values to plain Date values", () => {
    const uploadedAt = { toString: () => "2026-01-02T03:04:05Z" } as Date;
    const moderatedAt = { toString: () => "2026-01-03T03:04:05Z" } as Date;

    const photo = toPhoto({
      id: "photo-1",
      eventId: "event-1",
      fileKey: "photo.jpg",
      fileUrl: "https://example.com/photo.jpg",
      fileProvider: "local",
      thumbnailUrl: "https://example.com/thumb.jpg",
      guestName: null,
      guestIp: null,
      message: null,
      status: "approved",
      metadata: {},
      uploadedAt,
      moderatedAt,
    });

    expect(photo.uploadedAt).toEqual(new Date("2026-01-02T03:04:05Z"));
    expect(photo.moderatedAt).toEqual(new Date("2026-01-03T03:04:05Z"));
  });
});
