"use client";

import { useQuery } from "@tanstack/react-query";
import type { Event, ApiResponse } from "@/lib/types";

async function fetchEvent(slug: string): Promise<Event> {
  const res = await fetch(`/api/events/${slug}`);
  const data: ApiResponse<Event> = await res.json();

  if (!data.success || !data.data) {
    throw new Error(data.error?.message || "Gagal memuat acara");
  }

  return data.data;
}

export function useEvent(slug: string) {
  return useQuery({
    queryKey: ["event", slug],
    queryFn: () => fetchEvent(slug),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
}
