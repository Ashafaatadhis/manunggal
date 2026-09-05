"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSlideshow } from "@/hooks/useSlideshow";
import SlideshowPhotoView from "./SlideshowPhotoView";
import SlideshowControls from "./SlideshowControls";
import type {
  Photo,
  SlideshowCommand,
  SlideshowConfig,
  SlideshowCommandType,
} from "@/lib/types";

interface SlideshowStageProps {
  slug: string;
  title: string;
  eventId: string;
  initialPhotos: Photo[];
  initialConfig: SlideshowConfig;
}

interface LivePayload {
  eventId: string;
  slug: string;
  title: string;
  photos: Photo[];
  slideshowConfig: SlideshowConfig;
}

const PHOTO_EVENT_TYPES = ["photo:new", "photo:hidden", "photo:deleted"];

export default function SlideshowStage({
  slug,
  title,
  eventId,
  initialPhotos,
  initialConfig,
}: SlideshowStageProps) {
  const engine = useSlideshow(initialPhotos, initialConfig);
  const engineRef = useRef(engine);
  engineRef.current = engine;

  const [connected, setConnected] = useState(false);
  const knownIds = useRef<Set<string>>(new Set(initialPhotos.map((p) => p.id)));

  const refetchAndReconcile = useCallback(async () => {
    try {
      const res = await fetch(`/api/live/${slug}`);
      if (!res.ok) return;
      const data = (await res.json()) as {
        success: boolean;
        data?: LivePayload;
      };
      if (!data.success || !data.data) return;
      const fresh = data.data.photos;
      const freshIds = new Set(fresh.map((p) => p.id));

      // Removed
      for (const id of knownIds.current) {
        if (!freshIds.has(id)) {
          engineRef.current.applyPhotoEvent("photo:deleted", { photoId: id });
        }
      }
      // Added
      for (const p of fresh) {
        if (!knownIds.current.has(p.id)) {
          engineRef.current.applyPhotoEvent("photo:new", p);
        }
      }
      knownIds.current = freshIds;

      // Apply config updates from the server (host may have changed it)
      engineRef.current.applyCommand({
        type: "config",
        config: data.data.slideshowConfig,
      });
    } catch {
      // transient fetch error; ignore
    }
  }, [slug]);

  // Photos SSE channel (existing): new/approved/hidden/deleted photos.
  useEffect(() => {
    const es = new EventSource(`/api/g/${slug}/stream`);
    es.onmessage = (ev) => {
      try {
        const parsed = JSON.parse(ev.data) as { type: string };
        if (parsed.type === "connected") {
          setConnected(true);
          return;
        }
        if (PHOTO_EVENT_TYPES.includes(parsed.type)) {
          refetchAndReconcile();
        }
      } catch {
        // ignore malformed frame
      }
    };
    es.onerror = () => setConnected(false);
    return () => es.close();
  }, [slug, refetchAndReconcile]);

  // Control SSE channel: host remote commands (pause, resume, skip, stop, config).
  useEffect(() => {
    const es = new EventSource(`/api/live/${slug}/control-stream`);
    es.onmessage = (ev) => {
      try {
        const parsed = JSON.parse(ev.data) as {
          type: string;
          data?: { type?: SlideshowCommandType; config?: SlideshowConfig };
        };
        if (parsed.type === "slideshow:command" && parsed.data?.type) {
          const command: SlideshowCommand = {
            type: parsed.data.type,
            ...(parsed.data.config
              ? { config: parsed.data.config }
              : {}),
          };
          engineRef.current.applyCommand(command);
        }
      } catch {
        // ignore malformed frame
      }
    };
    return () => es.close();
  }, [slug]);

  // Refetch on mount and when the venue screen regains focus.
  useEffect(() => {
    const onFocus = () => refetchAndReconcile();
    window.addEventListener("focus", onFocus);
    refetchAndReconcile();
    return () => window.removeEventListener("focus", onFocus);
  }, [refetchAndReconcile]);

  const current = engine.photos[engine.currentIndex];

  return (
    <div className="relative h-full w-full">
      {current ? (
        <SlideshowPhotoView
          photo={current}
          showMessages={engine.showMessages}
          transition={engine.transition}
        />
      ) : (
        <div className="flex h-full items-center justify-center text-white">
          <p className="text-2xl">Belum ada foto yang ditampilkan</p>
        </div>
      )}

      {/* Top bar: title + live indicator */}
      <div className="absolute left-0 right-0 top-0 flex items-center justify-between px-6 py-4">
        <span className="text-white drop-shadow">{title}</span>
        <span className="flex items-center gap-2 text-sm text-white/80">
          <span
            className={`h-2 w-2 rounded-full ${
              connected ? "bg-green-400" : "bg-red-500"
            }`}
          />
          {connected ? "Live" : "Terhubung..."}
        </span>
      </div>

      {/* Local controls */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
        <SlideshowControls
          isPlaying={engine.isPlaying}
          onTogglePlay={engine.togglePlay}
          onPrev={engine.goToPrev}
          onNext={engine.goToNext}
          onStop={engine.stop}
        />
      </div>
    </div>
  );
}
