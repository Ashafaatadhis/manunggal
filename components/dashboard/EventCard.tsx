"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Event } from "@/lib/types";

interface EventCardProps {
  event: Event & { photos?: number };
}

const statusColors: Record<Event["status"], string> = {
  draft: "bg-gray-100 text-gray-700",
  active: "bg-green-100 text-green-700",
  live: "bg-blue-100 text-blue-700",
  ended: "bg-purple-100 text-purple-700",
};

const eventTypeLabels: Record<Event["eventType"], string> = {
  wedding: "Wedding",
  birthday: "Birthday",
  graduation: "Graduation",
  corporate: "Corporate",
  other: "Other",
};

export default function EventCard({ event }: EventCardProps) {
  return (
    <Link href={`/events/${event.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardHeader>
          <div className="flex items-start justify-between">
            <CardTitle className="text-lg">{event.title}</CardTitle>
            <Badge className={statusColors[event.status]}>
              {event.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <span>📅</span>
              <span>
                {new Date(event.date).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span>🏷️</span>
              <span>{eventTypeLabels[event.eventType]}</span>
            </div>
            {event.venue && (
              <div className="flex items-center gap-2">
                <span>📍</span>
                <span>{event.venue}</span>
              </div>
            )}
            {typeof event.photos === "number" && (
              <div className="flex items-center gap-2">
                <span>📷</span>
                <span>{event.photos} photos</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
