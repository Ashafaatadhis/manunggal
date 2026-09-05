import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock ioredis - Redis must be a class
vi.mock("ioredis", () => {
  const mockRedisInstance = {
    publish: vi.fn().mockResolvedValue(1),
    duplicate: vi.fn().mockReturnThis(),
    subscribe: vi.fn().mockResolvedValue(1),
    on: vi.fn(),
    unsubscribe: vi.fn().mockResolvedValue(1),
    quit: vi.fn().mockResolvedValue("OK"),
  };

  class MockRedis {
    constructor() {
      return mockRedisInstance;
    }
  }

  return {
    default: MockRedis,
  };
});

describe("Redis", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should export redis client", async () => {
    const { redis } = await import("@/lib/redis");
    expect(redis).toBeDefined();
  });

  it("should export publishPhoto function", async () => {
    const { publishPhoto } = await import("@/lib/redis");
    expect(typeof publishPhoto).toBe("function");
  });

  it("should export publishModeration function", async () => {
    const { publishModeration } = await import("@/lib/redis");
    expect(typeof publishModeration).toBe("function");
  });

  it("should export publishSlideshowCommand function", async () => {
    const { publishSlideshowCommand } = await import("@/lib/redis");
    expect(typeof publishSlideshowCommand).toBe("function");
  });

  it("should build a slideshow channel from an event id", async () => {
    const { slideshowChannel } = await import("@/lib/redis");
    expect(slideshowChannel("evt-1")).toBe("event:evt-1:slideshow");
  });

  it("should publish a slideshow command to the slideshow channel", async () => {
    const { redis, publishSlideshowCommand, slideshowChannel } = await import("@/lib/redis");
    const publishSpy = vi.mocked(redis.publish);
    await publishSlideshowCommand("evt-1", { type: "pause" });
    expect(publishSpy).toHaveBeenCalledWith(
      "event:evt-1:slideshow",
      JSON.stringify({ type: "slideshow:command", data: { type: "pause" } })
    );
  });
});
