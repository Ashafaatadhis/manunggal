import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useSlideshow } from "@/hooks/useSlideshow";
import type { Photo } from "@/lib/types";

function makePhoto(id: string): Photo {
  return {
    id,
    eventId: "evt",
    fileKey: id,
    fileUrl: `https://x/${id}.jpg`,
    fileProvider: "cloudinary",
    thumbnailUrl: `https://x/${id}_t.jpg`,
    guestName: null,
    status: "approved",
    metadata: {},
    uploadedAt: new Date("2025-01-01T00:00:00Z"),
  };
}

const config = { intervalSec: 5, transition: "fade" as const, showMessages: true };
const photos = [makePhoto("a"), makePhoto("b"), makePhoto("c")];

describe("useSlideshow", () => {
  it("starts on first photo, playing", () => {
    const { result } = renderHook(() => useSlideshow(photos, config));
    expect(result.current.currentIndex).toBe(0);
    expect(result.current.isPlaying).toBe(true);
    expect(result.current.photos.length).toBe(3);
  });

  it("advances on skip", () => {
    const { result } = renderHook(() => useSlideshow(photos, config));
    act(() => result.current.applyCommand({ type: "skip" }));
    expect(result.current.currentIndex).toBe(1);
  });

  it("prepends new photo without changing the displayed photo id", () => {
    const { result } = renderHook(() => useSlideshow(photos, config));
    const current = result.current.photos[result.current.currentIndex].id;
    act(() => result.current.applyPhotoEvent("photo:new", makePhoto("d")));
    expect(result.current.photos[0].id).toBe("d");
    // still showing the same photo as before (index shifted, id same)
    const shown = result.current.photos[result.current.currentIndex];
    expect(shown.id).toBe(current);
    expect(result.current.photos).toHaveLength(4);
  });

  it("dedupes a photo id already present", () => {
    const { result } = renderHook(() => useSlideshow(photos, config));
    act(() => result.current.applyPhotoEvent("photo:new", makePhoto("a")));
    expect(result.current.photos).toHaveLength(3);
  });

  it("removes hidden photo and stays in range", () => {
    const { result } = renderHook(() => useSlideshow(photos, config));
    act(() => result.current.applyPhotoEvent("photo:hidden", { photoId: "b" }));
    expect(result.current.photos.map((p) => p.id)).not.toContain("b");
    expect(result.current.currentIndex).toBeLessThan(result.current.photos.length);
  });

  it("pauses and resumes", () => {
    const { result } = renderHook(() => useSlideshow(photos, config));
    act(() => result.current.applyCommand({ type: "pause" }));
    expect(result.current.isPlaying).toBe(false);
    act(() => result.current.applyCommand({ type: "resume" }));
    expect(result.current.isPlaying).toBe(true);
  });

  it("stop stops playback", () => {
    const { result } = renderHook(() => useSlideshow(photos, config));
    act(() => result.current.applyCommand({ type: "stop" }));
    expect(result.current.isStopped).toBe(true);
    expect(result.current.isPlaying).toBe(false);
  });
});
