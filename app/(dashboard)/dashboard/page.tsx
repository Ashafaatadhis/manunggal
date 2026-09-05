"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import StatsCard from "@/components/dashboard/StatsCard";
import EventCard from "@/components/dashboard/EventCard";
import { Button } from "@/components/ui/button";
import type { Event, ApiResponse } from "@/lib/types";

interface DashboardStats {
  totalEvents: number;
  activeEvents: number;
  totalPhotos: number;
  pendingPhotos: number;
}

interface EventWithCount extends Event {
  _count: { photos: number };
}

export default function DashboardPage() {
  const { data: events, isLoading: eventsLoading } = useQuery({
    queryKey: ["events"],
    queryFn: async () => {
      const res = await fetch("/api/events?limit=5");
      const data: ApiResponse<EventWithCount[]> = await res.json();
      return data.data || [];
    },
  });

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const res = await fetch("/api/dashboard/stats");
      const data: ApiResponse<DashboardStats> = await res.json();
      return data.data;
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Dashboard</h2>
        <Link href="/events/create">
          <Button>+ Create Event</Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Events"
          value={stats?.totalEvents ?? 0}
          icon="🎉"
          description="All your events"
        />
        <StatsCard
          title="Active Events"
          value={stats?.activeEvents ?? 0}
          icon="🟢"
          description="Currently running"
        />
        <StatsCard
          title="Total Photos"
          value={stats?.totalPhotos ?? 0}
          icon="📷"
          description="All uploaded photos"
        />
        <StatsCard
          title="Pending Review"
          value={stats?.pendingPhotos ?? 0}
          icon="⏳"
          description="Awaiting moderation"
        />
      </div>

      {/* Recent Events */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Recent Events</h3>
          <Link href="/events" className="text-sm text-primary hover:underline">
            View all →
          </Link>
        </div>

        {eventsLoading ? (
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
    </div>
  );
}
