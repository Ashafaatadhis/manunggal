import { beforeEach, describe, expect, it, vi } from "vitest";

const redis = {
  incr: vi.fn(),
  expire: vi.fn(),
  ttl: vi.fn(),
};

vi.mock("@/lib/redis", () => ({ redis }));

describe("login rate limit", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("normalizes identifier before hashing its Redis key", async () => {
    const { getLoginIdentifier } = await import("@/lib/login-rate-limit");

    expect(getLoginIdentifier(" User@Example.COM ", " 127.0.0.1 ")).toBe(
      "user@example.com:127.0.0.1"
    );
  });

  it("sets window expiry on first attempt", async () => {
    redis.incr.mockResolvedValue(1);
    redis.expire.mockResolvedValue(1);
    redis.ttl.mockResolvedValue(900);
    const { checkLoginRateLimit, LOGIN_RATE_WINDOW_SECONDS } = await import(
      "@/lib/login-rate-limit"
    );

    await expect(checkLoginRateLimit("user@example.com", "127.0.0.1")).resolves.toEqual({
      allowed: true,
      retryAfter: 900,
    });
    expect(redis.expire).toHaveBeenCalledWith(
      expect.stringMatching(/^rate-limit:login:[a-f0-9]{64}$/),
      LOGIN_RATE_WINDOW_SECONDS
    );
  });

  it("blocks attempts beyond limit and returns remaining TTL", async () => {
    redis.incr.mockResolvedValue(6);
    redis.ttl.mockResolvedValue(720);
    const { checkLoginRateLimit } = await import("@/lib/login-rate-limit");

    await expect(checkLoginRateLimit("user@example.com", "127.0.0.1")).resolves.toEqual({
      allowed: false,
      retryAfter: 720,
    });
    expect(redis.expire).not.toHaveBeenCalled();
  });
});
