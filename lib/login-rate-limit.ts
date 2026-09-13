import { createHash } from "node:crypto";
import { redis } from "./redis";

export const LOGIN_RATE_LIMIT = 5;
export const LOGIN_RATE_WINDOW_SECONDS = 15 * 60;

function rateLimitKey(identifier: string): string {
  const digest = createHash("sha256").update(identifier).digest("hex");
  return `rate-limit:login:${digest}`;
}

export function getLoginIdentifier(email: string, ip: string): string {
  return `${email.trim().toLowerCase()}:${ip.trim() || "unknown"}`;
}

export async function checkLoginRateLimit(
  email: string,
  ip: string
): Promise<{ allowed: boolean; retryAfter: number }> {
  const key = rateLimitKey(getLoginIdentifier(email, ip));
  const attempts = await redis.incr(key);

  if (attempts === 1) {
    await redis.expire(key, LOGIN_RATE_WINDOW_SECONDS);
  }

  const ttl = await redis.ttl(key);
  return {
    allowed: attempts <= LOGIN_RATE_LIMIT,
    retryAfter: ttl > 0 ? ttl : LOGIN_RATE_WINDOW_SECONDS,
  };
}
