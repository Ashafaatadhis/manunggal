import { describe, it, expect, vi, beforeEach } from "vitest";
import logger, {
  authLogger,
  eventLogger,
  photoLogger,
  uploadLogger,
} from "@/lib/logger";

// Mock pino
vi.mock("pino", () => {
  const mockLogger = {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    child: vi.fn().mockReturnThis(),
  };
  return {
    default: vi.fn(() => mockLogger),
  };
});

describe("Logger", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should export default logger", () => {
    expect(logger).toBeDefined();
  });

  it("should export authLogger", () => {
    expect(authLogger).toBeDefined();
  });

  it("should export eventLogger", () => {
    expect(eventLogger).toBeDefined();
  });

  it("should export photoLogger", () => {
    expect(photoLogger).toBeDefined();
  });

  it("should export uploadLogger", () => {
    expect(uploadLogger).toBeDefined();
  });
});
