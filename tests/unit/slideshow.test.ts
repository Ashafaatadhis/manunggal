import { describe, it, expect } from "vitest";

describe("readSlideshowConfig", () => {
  it("returns defaults when settings has no slideshow block", async () => {
    const { readSlideshowConfig } = await import("@/lib/slideshow");
    const config = readSlideshowConfig({});
    expect(config).toEqual({
      intervalSec: 5,
      transition: "fade",
      showMessages: true,
    });
  });

  it("reads nested slideshow config and fills gaps from defaults", async () => {
    const { readSlideshowConfig } = await import("@/lib/slideshow");
    const config = readSlideshowConfig({
      slideshow: { intervalSec: 7, transition: "zoom" },
    });
    expect(config.intervalSec).toBe(7);
    expect(config.transition).toBe("zoom");
    expect(config.showMessages).toBe(true);
  });
});