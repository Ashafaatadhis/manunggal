"use client";

import Link from "next/link";
import {
  ArrowUpRight,
  CalendarDays,
  Images,
  MapPin,
  Tag,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Event } from "@/lib/types";

interface EventCardProps {
  event: Event & { photos?: number };
}

const statusColors: Record<Event["status"], string> = {
  draft: "border-slate-200 bg-slate-100 text-slate-700",
  active: "border-emerald-200 bg-emerald-50 text-emerald-700",
  live: "border-blue-200 bg-blue-50 text-blue-700",
  ended: "border-violet-200 bg-violet-50 text-violet-700",
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
    <Link
      href={`/events/${event.id}`}
      className="group block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      <Card className="h-full border-transparent bg-white shadow-sm transition-all duration-200 group-hover:-translate-y-0.5 group-hover:border-primary/20 group-hover:shadow-lg">
        <CardHeader className="gap-4 border-b border-border/60 pb-4">
          <div className="flex items-start justify-between gap-3">
            <CardTitle className="line-clamp-2 text-lg font-semibold leading-tight">
              {event.title}
            </CardTitle>
            <Badge className={statusColors[event.status]}>
              {event.status}
            </Badge>
          </div>
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <CalendarDays className="size-5" aria-hidden="true" />
          </div>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col justify-between gap-5 pt-4">
          <div className="flex flex-col gap-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-3">
              <CalendarDays className="size-4 shrink-0 text-primary" aria-hidden="true" />
              <span className="truncate">
                {new Date(event.date).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Tag className="size-4 shrink-0 text-primary" aria-hidden="true" />
              <span>{eventTypeLabels[event.eventType]}</span>
            </div>
            {event.venue && (
              <div className="flex items-center gap-3">
                <MapPin className="size-4 shrink-0 text-primary" aria-hidden="true" />
                <span className="truncate">{event.venue}</span>
              </div>
            )}
          </div>
        </CardContent>
        {typeof event.photos === "number" && (
          <CardFooter className="justify-between border-t border-border/60 bg-slate-50/70 py-3 text-sm">
            <span className="flex items-center gap-2 font-medium text-foreground">
              <Images className="size-4 text-primary" aria-hidden="true" />
              {event.photos} photos
            </span>
            <ArrowUpRight
              className="size-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </CardFooter>
        )}
      </Card>
    </Link>
  );
}
