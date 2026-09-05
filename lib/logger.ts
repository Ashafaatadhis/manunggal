import pino from "pino";

const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  transport:
    process.env.NODE_ENV !== "production"
      ? { target: "pino-pretty", options: { colorize: true } }
      : undefined,
});

export default logger;

// Child loggers for specific modules
export const authLogger = logger.child({ module: "auth" });
export const eventLogger = logger.child({ module: "event" });
export const photoLogger = logger.child({ module: "photo" });
export const uploadLogger = logger.child({ module: "upload" });
