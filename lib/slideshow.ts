import {
  DEFAULT_SLIDESHOW_CONFIG,
  type SlideshowConfig,
  type EventSettings,
} from "./types";

export function readSlideshowConfig(settings: unknown): SlideshowConfig {
  const s = (settings ?? {}) as Partial<EventSettings>;
  const nested = s.slideshow;
  return {
    intervalSec: nested?.intervalSec ?? DEFAULT_SLIDESHOW_CONFIG.intervalSec,
    transition: nested?.transition ?? DEFAULT_SLIDESHOW_CONFIG.transition,
    showMessages: nested?.showMessages ?? DEFAULT_SLIDESHOW_CONFIG.showMessages,
  };
}
