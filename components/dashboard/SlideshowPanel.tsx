"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
          className="text-sm text-primary underline"
        >
          Buka Layar Slideshow
        </a>
      </div>

      <div className="mb-3 flex flex-wrap gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => send.mutate({ type: "pause" })}
        >
          ⏸ Jeda
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => send.mutate({ type: "resume" })}
        >
          ▶ Lanjut
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => send.mutate({ type: "skip" })}
        >
          ⏭ Lewati
        </Button>
        <Button
          size="sm"
          variant="destructive"
          onClick={() => send.mutate({ type: "stop" })}
        >
          ⏹ Berhenti
        </Button>
      </div>

      <div className="flex items-center gap-3 text-sm">
        <label htmlFor="slideshow-interval" className="text-muted-foreground">
          Interval
        </label>
        <select
          id="slideshow-interval"
          value={localInterval}
          onChange={(e) => {
            const v = Number(e.target.value);
            setLocalInterval(v);
            send.mutate({
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
