"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Clock3,
  ExternalLink,
  Pause,
  Play,
  SkipBack,
  SkipForward,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type {
  ApiResponse,
  SlideshowCommand,
  SlideshowTransition,
} from "@/lib/types";

interface SlideshowPanelProps {
  eventId: string;
  slug: string;
  intervalSec?: number;
  transition?: SlideshowTransition;
}

export default function SlideshowPanel({
  eventId,
  slug,
  intervalSec = 5,
  transition = "fade",
}: SlideshowPanelProps) {
  const queryClient = useQueryClient();
  const [localInterval, setLocalInterval] = useState(intervalSec);
  const [isPaused, setIsPaused] = useState(false);
  const [activeCommand, setActiveCommand] = useState<SlideshowCommand["type"]>();

  function sendCommand(command: SlideshowCommand) {
    setActiveCommand(command.type);
    send.mutate(command);
  }

  function togglePause() {
    const type = isPaused ? "resume" : "pause";
    setIsPaused((paused) => !paused);
    sendCommand({ type });
  }

  const send = useMutation({
    mutationFn: async (command: SlideshowCommand) => {
      const res = await fetch(`/api/events/${eventId}/slideshow/control`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(command),
      });
      const data: ApiResponse<{ published: boolean }> = await res.json();
      if (!data.success) throw new Error(data.error?.message);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["event", eventId] });
    },
  });

  return (
    <div className="rounded-xl border p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-semibold">Slideshow</h3>
        <a
          href={`/live/${slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          <ExternalLink className="size-4" aria-hidden="true" />
          Buka layar venue
        </a>
      </div>

      <div className="mb-3 flex flex-wrap gap-2">
        <Button
          size="sm"
          variant={isPaused ? "default" : "outline"}
          aria-pressed={isPaused}
          onClick={togglePause}
        >
          {isPaused ? (
            <Play data-icon="inline-start" aria-hidden="true" />
          ) : (
            <Pause data-icon="inline-start" aria-hidden="true" />
          )}
          {isPaused ? "Lanjutkan slideshow" : "Jeda slideshow"}
        </Button>
        <Button
          size="sm"
          variant={activeCommand === "prev" ? "default" : "outline"}
          aria-pressed={activeCommand === "prev"}
          onClick={() => sendCommand({ type: "prev" })}
        >
          <SkipBack data-icon="inline-start" aria-hidden="true" />
          Foto sebelumnya
        </Button>
        <Button
          size="sm"
          variant={activeCommand === "next" ? "default" : "outline"}
          aria-pressed={activeCommand === "next"}
          onClick={() => sendCommand({ type: "next" })}
        >
          <SkipForward data-icon="inline-start" aria-hidden="true" />
          Foto berikutnya
        </Button>
      </div>

      <div className="flex items-center gap-3 text-sm">
        <label htmlFor="slideshow-interval" className="flex items-center gap-2 text-muted-foreground">
          <Clock3 className="size-4 text-primary" aria-hidden="true" />
          Ganti foto setiap
        </label>
        <select
          id="slideshow-interval"
          value={localInterval}
          onChange={(e) => {
            const v = Number(e.target.value);
            setLocalInterval(v);
            sendCommand({
              type: "config",
              config: { intervalSec: v, transition, showMessages: true },
            });
          }}
          className="rounded border px-2 py-1"
        >
          {[3, 5, 7, 10].map((sec) => (
            <option key={sec} value={sec}>
              {sec} detik
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
