"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import StatsCard from "@/components/dashboard/StatsCard";
import EventCard from "@/components/dashboard/EventCard";
import { Button } from "@/components/ui/button";
import type { Event, ApiResponse } from "@/lib/types";
import { CardListSkeleton, ErrorState } from "@/components/shared/AsyncState";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarDays, CircleCheck, Clock3, Images } from "lucide-react";

interface DashboardStats {
  totalEvents: number;
  activeEvents: number;
  totalPhotos: number;
  pendingPhotos: number;
}

interface EventWithCount extends Event {
  photos: number;
}

export default function DashboardPage() {
  const { data: events, isLoading: eventsLoading, error: eventsQueryError, refetch: refetchEvents } = useQuery({
    queryKey: ["events"],
    queryFn: async () => {
      const res = await fetch("/api/events?limit=5");
      const data: ApiResponse<EventWithCount[]> = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error?.message || "Gagal memuat event");
      return data.data || [];
    },
  });

  const { data: stats, isLoading: statsLoading, error: statsQueryError, refetch: refetchStats } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const res = await fetch("/api/dashboard/stats");
      const data: ApiResponse<DashboardStats> = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error?.message || "Gagal memuat statistik");
      return data.data;
    },
  });

  if (statsQueryError) {
    return <ErrorState message={statsQueryError.message || "Gagal memuat statistik"} onRetry={() => void refetchStats()} />;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Dashboard</h2>
        <Link href="/events/create">
          <Button>+ Create Event</Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Events"
          value={statsLoading ? <Skeleton className="h-8 w-14" /> : stats?.totalEvents ?? 0}
          icon={<CalendarDays className="size-5 text-primary" aria-hidden="true" />}
          description="All your events"
        />
        <StatsCard
          title="Active Events"
          value={statsLoading ? <Skeleton className="h-8 w-14" /> : stats?.activeEvents ?? 0}
          icon={<CircleCheck className="size-5 text-primary" aria-hidden="true" />}
          description="Currently running"
        />
        <StatsCard
          title="Total Photos"
          value={statsLoading ? <Skeleton className="h-8 w-14" /> : stats?.totalPhotos ?? 0}
          icon={<Images className="size-5 text-primary" aria-hidden="true" />}
          description="All uploaded photos"
        />
        <StatsCard
          title="Pending Review"
          value={statsLoading ? <Skeleton className="h-8 w-14" /> : stats?.pendingPhotos ?? 0}
          icon={<Clock3 className="size-5 text-primary" aria-hidden="true" />}
          description="Awaiting moderation"
        />
      </div>

      {/* Recent Events */}
      <div>
          <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Recent Events</h3>
          <Link href="/events" className="text-sm text-primary hover:underline">
            View all →
          </Link>
        </div>

        {eventsLoading ? (
          <CardListSkeleton count={3} />
        ) : eventsQueryError ? (
          <ErrorState message={eventsQueryError.message} onRetry={() => void refetchEvents()} />
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
