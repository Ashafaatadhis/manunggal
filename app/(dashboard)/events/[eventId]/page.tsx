"use client";

import { useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import PhotoCard from "@/components/dashboard/PhotoCard";
import type { Event, Photo, ApiResponse } from "@/lib/types";

interface EventWithPhotos extends Event {
  photos: Photo[];
}

export default function EventDetailPage() {
  const params = useParams();
  const eventId = params.eventId as string;
  const queryClient = useQueryClient();

  const { data: event, isLoading } = useQuery({
    queryKey: ["event", eventId],
    queryFn: async () => {
      const res = await fetch(`/api/events/${eventId}`);
      const data: ApiResponse<EventWithPhotos> = await res.json();
      if (!data.success) throw new Error(data.error?.message || "Event not found");
      return data.data;
    },
  });

  const moderateMutation = useMutation({
    mutationFn: async ({ photoId, status }: { photoId: string; status: "approved" | "hidden" }) => {
      const res = await fetch(`/api/photos/${photoId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error?.message);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["event", eventId] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (photoId: string) => {
      const res = await fetch(`/api/photos/${photoId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "deleted" }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error?.message);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["event", eventId] });
    },
  });

  const statusColors: Record<Event["status"], string> = {
    draft: "bg-gray-100 text-gray-700",
    active: "bg-green-100 text-green-700",
    live: "bg-blue-100 text-blue-700",
    ended: "bg-purple-100 text-purple-700",
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (!event) {
    return <div className="text-center py-8">Event not found</div>;
  }

  const pendingPhotos = event.photos.filter((p) => p.status === "pending");
  const approvedPhotos = event.photos.filter((p) => p.status === "approved");

  return (
    <div className="space-y-6">
      {/* Event Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl">{event.title}</CardTitle>
              <p className="text-muted-foreground mt-1">
                {new Date(event.date).toLocaleDateString("id-ID", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
            <Badge className={statusColors[event.status]}>{event.status}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Event Type</span>
              <p className="font-medium">{event.eventType}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Venue</span>
              <p className="font-medium">{event.venue || "Not specified"}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Time</span>
              <p className="font-medium">
                {new Date(event.startTime).toLocaleTimeString("id-ID", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}{" "}
                -{" "}
                {new Date(event.endTime).toLocaleTimeString("id-ID", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">Photos</span>
              <p className="font-medium">{event.photos.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Guest Link */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Guest Access</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <code className="flex-1 p-2 bg-muted rounded text-sm">
              {`manunggal.com/g/${event.slug}`}
            </code>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                navigator.clipboard.writeText(
                  `${window.location.origin}/g/${event.slug}`
                );
              }}
            >
              Copy Link
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Pending Moderation */}
      {pendingPhotos.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">
            Pending Moderation ({pendingPhotos.length})
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {pendingPhotos.map((photo) => (
              <PhotoCard
                key={photo.id}
                photo={photo}
                onApprove={(id) =>
                  moderateMutation.mutate({ photoId: id, status: "approved" })
                }
                onReject={(id) =>
                  moderateMutation.mutate({ photoId: id, status: "hidden" })
                }
                onDelete={(id) => deleteMutation.mutate(id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Approved Photos */}
      <div>
        <h3 className="text-lg font-semibold mb-4">
          Approved Photos ({approvedPhotos.length})
        </h3>
        {approvedPhotos.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {approvedPhotos.map((photo) => (
              <PhotoCard
                key={photo.id}
                photo={photo}
                showActions={false}
                onDelete={(id) => deleteMutation.mutate(id)}
              />
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-8">
            No approved photos yet
          </p>
        )}
      </div>
    </div>
  );
}
