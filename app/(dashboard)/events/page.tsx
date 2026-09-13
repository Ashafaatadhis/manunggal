"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import EventCard from "@/components/dashboard/EventCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import type { Event, ApiResponse } from "@/lib/types";
import { CardListSkeleton, ErrorState } from "@/components/shared/AsyncState";

interface EventWithCount extends Event {
  photos: number;
}

export default function EventsPage() {
  const [search, setSearch] = useState("");
  const { data: events, isLoading, error, refetch } = useQuery({
    queryKey: ["events"],
    queryFn: async () => {
      const res = await fetch("/api/events");
      const data: ApiResponse<EventWithCount[]> = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error?.message || "Gagal memuat event");
      return data.data || [];
    },
  });

  const filterByStatus = (status: Event["status"]) => {
    return filteredEvents?.filter((e) => e.status === status) || [];
  };

  const filteredEvents = events?.filter((event) =>
    `${event.title} ${event.venue || ""}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Events</h2>
        <Link href="/events/create">
          <Button>+ Create Event</Button>
        </Link>
      </div>

      <Input
        aria-label="Search events"
        className="bg-white"
        placeholder="Search events..."
        value={search}
        onChange={(event) => setSearch(event.target.value)}
      />

      {/* Status Tabs */}
      <div className="flex gap-2">
        {(["draft", "active", "live", "ended"] as const).map((status) => (
          <Badge
            key={status}
            variant="outline"
            className="cursor-pointer"
          >
            {status} ({filterByStatus(status).length})
          </Badge>
        ))}
      </div>

      {/* Events Grid */}
      {isLoading ? (
        <CardListSkeleton count={6} />
      ) : error ? (
        <ErrorState message={error.message} onRetry={() => void refetch()} />
      ) : events && events.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEvents?.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 border border-dashed rounded-lg">
          <p className="text-muted-foreground mb-4">No events yet</p>
          <Link href="/events/create">
            <Button>Create your first event</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
