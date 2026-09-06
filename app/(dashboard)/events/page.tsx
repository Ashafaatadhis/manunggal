"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import EventCard from "@/components/dashboard/EventCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Event, ApiResponse } from "@/lib/types";

interface EventWithCount extends Event {
  photos: number;
}

export default function EventsPage() {
  const { data: events, isLoading } = useQuery({
    queryKey: ["events"],
    queryFn: async () => {
      const res = await fetch("/api/events");
      const data: ApiResponse<EventWithCount[]> = await res.json();
      return data.data || [];
    },
  });

  const filterByStatus = (status: Event["status"]) => {
    return events?.filter((e) => e.status === status) || [];
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Events</h2>
        <Link href="/events/create">
          <Button>+ Create Event</Button>
        </Link>
      </div>

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
        <div className="text-center py-8 text-muted-foreground">Loading...</div>
      ) : events && events.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {events.map((event) => (
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
