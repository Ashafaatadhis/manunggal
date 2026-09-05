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
});
