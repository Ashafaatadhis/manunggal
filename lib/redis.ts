import Redis from "ioredis";

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
