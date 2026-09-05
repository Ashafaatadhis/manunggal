import Redis from "ioredis";
import type { SlideshowCommand } from "./types";

const globalForRedis = globalThis as unknown as {
  redis: Redis | undefined;
};

function createRedisClient(): Redis {
  return new Redis(process.env.REDIS_URL || "redis://localhost:6379", {
    maxRetriesPerRequest: 3,
    retryStrategy(times) {
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
  });
}

export const redis = globalForRedis.redis ?? createRedisClient();

if (process.env.NODE_ENV !== "production") globalForRedis.redis = redis;

export async function publishPhoto(eventId: string, photo: any) {
  await redis.publish(
    `event:${eventId}:photos`,
    JSON.stringify({
      type: "photo:new",
      data: photo,
    })
  );
}

export async function publishModeration(
  eventId: string,
  photoId: string,
  action: string
) {
  await redis.publish(
    `event:${eventId}:photos`,
    JSON.stringify({
      type: `photo:${action}`,
      data: { photoId },
    })
  );
}

export function slideshowChannel(eventId: string): string {
  return `event:${eventId}:slideshow`;
}

export async function publishSlideshowCommand(
  eventId: string,
  command: SlideshowCommand
): Promise<void> {
  await redis.publish(
    slideshowChannel(eventId),
    JSON.stringify({
      type: "slideshow:command",
      data: command,
    })
  );
}
