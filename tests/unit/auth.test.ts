import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock jose - SignJWT must be a class
vi.mock("jose", () => {
  const mockSign = vi.fn().mockResolvedValue("mock-jwt-token");

  class MockSignJWT {
    setProtectedHeader = vi.fn().mockReturnThis();
    setIssuedAt = vi.fn().mockReturnThis();
    setExpirationTime = vi.fn().mockReturnThis();
    sign = mockSign;
  }

  return {
    SignJWT: MockSignJWT,
    jwtVerify: vi.fn(),
  };
});

describe("Auth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("signToken", () => {
    it("should sign a JWT token with correct payload", async () => {
      const { SignJWT } = await import("jose");
      const { signToken } = await import("@/lib/auth");

      const payload = {
        userId: "user-123",
        email: "test@example.com",
        role: "host",
      };

      const token = await signToken(payload);

      expect(token).toBe("mock-jwt-token");
      expect(typeof SignJWT).toBe("function");
    });
  });

  describe("verifyToken", () => {
    it("should verify a valid token", async () => {
      const { jwtVerify } = await import("jose");
      const { verifyToken } = await import("@/lib/auth");

      const mockPayload = {
        userId: "user-123",
        email: "test@example.com",
        role: "host",
      };

      vi.mocked(jwtVerify).mockResolvedValue({
        payload: mockPayload as any,
        protectedHeader: { alg: "HS256" },
      } as any);

      const result = await verifyToken("valid-token");

      expect(result).toEqual(mockPayload);
    });

    it("should return null for invalid token", async () => {
      const { jwtVerify } = await import("jose");
      const { verifyToken } = await import("@/lib/auth");

      vi.mocked(jwtVerify).mockRejectedValue(new Error("Invalid token"));

      const result = await verifyToken("invalid-token");

      expect(result).toBeNull();
    });
  });
});
