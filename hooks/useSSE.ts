"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface SSEEvent {
  type: string;
  data: Record<string, unknown>;
}

interface UseSSEReturn {
  events: SSEEvent[];
  connected: boolean;
}

export function useSSE(slug: string): UseSSEReturn {
  const [events, setEvents] = useState<SSEEvent[]>([]);
  const [connected, setConnected] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);

  const addEvent = useCallback((event: SSEEvent) => {
    setEvents((prev) => [...prev, event]);
  }, []);

  useEffect(() => {
    const eventSource = new EventSource(`/api/g/${slug}/stream`);
    eventSourceRef.current = eventSource;

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "connected") {
          setConnected(true);
        } else {
          addEvent(data);
        }
      } catch (e) {
        console.error("SSE parse error:", e);
      }
    };

    eventSource.onerror = () => {
      setConnected(false);
    };

    return () => {
      eventSource.close();
    };
  }, [slug, addEvent]);

  return { events, connected };
}