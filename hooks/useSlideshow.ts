"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
  Photo,
  SlideshowConfig,
  SlideshowCommand,
  SlideshowTransition,
} from "@/lib/types";

export interface SlideshowEngineState {
  photos: Photo[];
  currentIndex: number;
  isPlaying: boolean;
  isStopped: boolean;
  direction: 1 | -1;
  transition: SlideshowTransition;
  showMessages: boolean;
}

export interface SlideshowEngine extends SlideshowEngineState {
  goToNext: () => void;
  goToPrev: () => void;
  togglePlay: () => void;
  stop: () => void;
  applyPhotoEvent: (type: string, data: unknown) => void;
  applyCommand: (command: SlideshowCommand) => void;
}

export function useSlideshow(
  initialPhotos: Photo[],
  config: SlideshowConfig
): SlideshowEngine {
  const photosRef = useRef<Photo[]>(initialPhotos);
  const [photos, setPhotos] = useState<Photo[]>(initialPhotos);
  const [currentPhotoId, setCurrentPhotoId] = useState<string | null>(
    initialPhotos[0]?.id ?? null
  );
  const [isPlaying, setIsPlaying] = useState(true);
  const [isStopped, setIsStopped] = useState(false);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [intervalSec, setIntervalSec] = useState(config.intervalSec);
  const [transition, setTransition] = useState(config.transition);
  const [showMessages, setShowMessages] = useState(config.showMessages);

  const indexOf = useCallback(
    (id: string | null) =>
      id ? photosRef.current.findIndex((p) => p.id === id) : -1,
    []
  );

  const reconcileTo = useCallback(
    (id: string | null, fallback: number) => {
      const idx = indexOf(id);
      if (idx >= 0) return idx;
      if (photosRef.current.length === 0) return -1;
      const clamped = Math.min(fallback, photosRef.current.length - 1);
      return Math.max(0, clamped);
    },
    [indexOf]
  );

  const commit = useCallback((next: Photo[]) => {
    photosRef.current = next;
    setPhotos(next);
    setCurrentPhotoId((prev) => {
      const existing = next.find((p) => p.id === prev);
      if (existing) return prev;
      // current removed; point at what is now at the same slot, clamp to tail
      return next[0]?.id ?? null;
    });
  }, []);

  const applyPhotoEvent = useCallback(
    (type: string, data: unknown) => {
      if (type === "photo:new") {
        const photo = data as Photo;
        if (!photo?.id) return;
        const exists = photosRef.current.some((p) => p.id === photo.id);
        if (exists) return;
        const next = [photo, ...photosRef.current];
        photosRef.current = next;
        setPhotos(next);
        // If nothing was showing, start on the new photo.
        setCurrentPhotoId((prev) => prev ?? photo.id);
        return;
      }
      if (type === "photo:deleted" || type === "photo:hidden") {
        const photoId = (data as { photoId?: string }).photoId;
        if (!photoId) return;
        const next = photosRef.current.filter((p) => p.id !== photoId);
        commit(next);
      }
    },
    [commit]
  );

  const goToNext = useCallback(() => {
    if (photosRef.current.length === 0) return;
    setDirection(1);
    setCurrentPhotoId((prev) => {
      const idx = reconcileTo(prev, 0);
      return (
        photosRef.current[(idx + 1) % photosRef.current.length]?.id ?? null
      );
    });
  }, [reconcileTo]);

  const goToPrev = useCallback(() => {
    if (photosRef.current.length === 0) return;
    setDirection(-1);
    setCurrentPhotoId((prev) => {
      const idx = reconcileTo(prev, 0);
      return (
        photosRef.current[
          (idx - 1 + photosRef.current.length) % photosRef.current.length
        ]?.id ?? null
      );
    });
  }, [reconcileTo]);

  const applyCommand = useCallback(
    (command: SlideshowCommand) => {
      switch (command.type) {
        case "pause":
          setIsPlaying(false);
          break;
        case "resume":
          setIsStopped(false);
          setIsPlaying(true);
          break;
        case "next":
          setDirection(1);
          setCurrentPhotoId((prev) => {
            const idx = reconcileTo(prev, 0);
            if (photosRef.current.length === 0) return null;
            return (
              photosRef.current[(idx + 1) % photosRef.current.length]?.id ??
              null
            );
          });
          break;
        case "prev":
          setDirection(-1);
          setCurrentPhotoId((prev) => {
            const idx = reconcileTo(prev, 0);
            if (photosRef.current.length === 0) return null;
            return (
              photosRef.current[
                (idx - 1 + photosRef.current.length) % photosRef.current.length
              ]?.id ?? null
            );
          });
          break;
        case "stop":
          setIsStopped(true);
          setIsPlaying(false);
          break;
        case "config":
          if (command.config) {
            setIntervalSec(command.config.intervalSec);
            setTransition(command.config.transition);
            setShowMessages(command.config.showMessages);
          }
          break;
      }
    },
    [reconcileTo]
  );

  const togglePlay = useCallback(() => {
    if (isStopped) {
      setIsStopped(false);
      setIsPlaying(true);
      return;
    }
    setIsPlaying((p) => !p);
  }, [isStopped]);

  const stop = useCallback(() => {
    setIsStopped(true);
    setIsPlaying(false);
  }, []);

  // Auto-advance while playing
  useEffect(() => {
    if (!isPlaying || isStopped || photosRef.current.length <= 1) return;
    const timer = setInterval(() => {
      setDirection(1);
      setCurrentPhotoId((prev) => {
        const idx = reconcileTo(prev, 0);
        if (photosRef.current.length === 0) return null;
        return (
          photosRef.current[(idx + 1) % photosRef.current.length]?.id ?? null
        );
      });
    }, intervalSec * 1000);
    return () => clearInterval(timer);
  }, [
    isPlaying,
    isStopped,
    intervalSec,
    reconcileTo,
    photos.length,
    currentPhotoId,
  ]);

  const currentIndex = useMemo(() => {
    const index = currentPhotoId
      ? photos.findIndex((photo) => photo.id === currentPhotoId)
      : -1;
    if (index >= 0) return index;
    return photos.length > 0 ? 0 : -1;
  }, [currentPhotoId, photos]);

  return {
    photos,
    currentIndex,
    isPlaying,
    isStopped,
    direction,
    transition,
    showMessages,
    goToNext,
    goToPrev,
    togglePlay,
    stop,
    applyPhotoEvent,
    applyCommand,
  };
}
