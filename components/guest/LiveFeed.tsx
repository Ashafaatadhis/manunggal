"use client";

import { useState, useEffect } from "react";
import { useSSE } from "@/hooks/useSSE";
import PhotoCard from "./PhotoCard";
import type { Photo } from "@/lib/types";

interface LiveFeedProps {
  slug: string;
  initialPhotos: Photo[];
}

export default function LiveFeed({ slug, initialPhotos }: LiveFeedProps) {
  const [photos, setPhotos] = useState<Photo[]>(initialPhotos);
  const { events, connected } = useSSE(slug);

  // Process SSE events
  useEffect(() => {
    events.forEach((event) => {
      if (event.type === "photo:new") {
        setPhotos((prev) => [event.data as unknown as Photo, ...prev]);
      } else if (event.type === "photo:deleted") {
        setPhotos((prev) =>
          prev.filter((p) => p.id !== (event.data as { photoId: string }).photoId)
        );
      } else if (event.type === "photo:hidden") {
        setPhotos((prev) =>
          prev.filter((p) => p.id !== (event.data as { photoId: string }).photoId)
        );
      }
    });
  }, [events]);

  return (
    <div className="min-h-screen bg-cream-100 py-6 px-4">
      <div className="max-w-sm mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-foreground">Live Feed</h1>
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${
                connected ? "bg-green-500" : "bg-red-500"
              }`}
            />
            <span className="text-xs text-muted-foreground">
              {connected ? "Live" : "Connecting..."}
            </span>
          </div>
        </div>

        {photos.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-4xl mb-4">📷</div>
            <p className="text-muted-foreground">Belum ada foto. Jadilah yang pertama!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {photos.map((photo) => (
              <PhotoCard key={photo.id} photo={photo} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}