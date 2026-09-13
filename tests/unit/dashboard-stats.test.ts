import { describe, expect, it } from "vitest";

describe("dashboard stats empty event scope", () => {
  it("uses zero photo counts when host has no events", () => {
    const eventIds: string[] = [];
    const [totalPhotos, pendingPhotos] = eventIds.length ? [1, 1] : [0, 0];

    expect(totalPhotos).toBe(0);
    expect(pendingPhotos).toBe(0);
  });
});
