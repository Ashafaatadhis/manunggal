"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import PhotoCard from "@/components/dashboard/PhotoCard";
import SlideshowPanel from "@/components/dashboard/SlideshowPanel";
import GuestAccessCard from "@/components/dashboard/GuestAccessCard";
import SignagePanel from "@/components/dashboard/SignagePanel";
import type { Event, Photo, ApiResponse, EventBranding } from "@/lib/types";
import { ErrorState } from "@/components/shared/AsyncState";
import { Skeleton } from "@/components/ui/skeleton";
import { getEventStatusAction } from "@/lib/event-lifecycle";

interface EventWithPhotos extends Event {
  photos: Photo[];
}

export default function EventDetailPage() {
  const params = useParams();
  const eventId = params.eventId as string;
  const queryClient = useQueryClient();
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);

  const { data: event, isLoading, error, refetch } = useQuery({
    queryKey: ["event", eventId],
    refetchInterval: 5000,
    refetchOnWindowFocus: true,
    queryFn: async () => {
      const res = await fetch(`/api/events/${eventId}`);
      const data: ApiResponse<EventWithPhotos> = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error?.message || "Event not found");
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

  const brandingMutation = useMutation({
    mutationFn: async (qr: NonNullable<EventBranding["qr"]>) => {
      const res = await fetch(`/api/events/${eventId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ branding: { qr } }),
      });
      const data: ApiResponse<Event> = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error?.message || "Gagal menyimpan kustomisasi QR");
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["event", eventId] });
    },
  });

  const settingsMutation = useMutation({
    mutationFn: async (settings: { autoApprove: boolean }) => {
      const res = await fetch(`/api/events/${eventId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings }),
      });
      const data: ApiResponse<Event> = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || "Gagal menyimpan pengaturan moderasi");
      }
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["event", eventId] });
    },
  });

  const statusMutation = useMutation({
    mutationFn: async (status: "active" | "ended") => {
      const res = await fetch(`/api/events/${eventId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data: ApiResponse<Event> = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || "Gagal mengubah status event");
      }
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["event", eventId] });
      queryClient.invalidateQueries({ queryKey: ["events"] });
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
    draft: "border-slate-200 bg-slate-100 text-slate-700",
    active: "border-emerald-200 bg-emerald-50 text-emerald-700",
    live: "border-blue-200 bg-blue-50 text-blue-700",
    ended: "border-violet-200 bg-violet-50 text-violet-700",
  };

  const statusLabels: Record<Event["status"], string> = {
    draft: "Draft",
    active: "Aktif",
    live: "Sedang Tayang",
    ended: "Selesai",
  };

  const eventTypeLabels: Record<Event["eventType"], string> = {
    wedding: "Pernikahan",
    birthday: "Ulang Tahun",
    graduation: "Wisuda",
    corporate: "Korporat",
    other: "Lainnya",
  };

  if (isLoading) {
    return <div className="flex flex-col gap-4" aria-label="Loading event">
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-40 w-full" />
      <Skeleton className="h-64 w-full" />
    </div>;
  }

  if (error || !event) {
    return <ErrorState message={error?.message || "Event not found"} onRetry={() => void refetch()} />;
  }

  const pendingPhotos = event.photos.filter((p) => p.status === "pending");
  const approvedPhotos = event.photos.filter((p) => p.status === "approved");
  const statusAction = getEventStatusAction(event.status);

  function changeStatus() {
    if (!statusAction || statusMutation.isPending) return;
    setIsStatusDialogOpen(true);
  }

  function confirmStatusChange() {
    if (!statusAction || statusMutation.isPending) return;
    const nextStatus = statusAction === "activate" ? "active" : "ended";
    statusMutation.mutate(nextStatus, {
      onSuccess: () => setIsStatusDialogOpen(false),
    });
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Event Header */}
      <Card className="overflow-hidden border-slate-200 bg-white shadow-sm">
        <CardHeader className="border-b border-slate-200 bg-slate-50/80 px-6 py-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                Detail event
              </p>
              <CardTitle className="text-2xl font-semibold tracking-tight sm:text-3xl">{event.title}</CardTitle>
              <p className="mt-2 text-sm text-muted-foreground">
                {new Date(event.date).toLocaleDateString("id-ID", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Badge className={`h-8 rounded-md border px-3 text-sm font-semibold ${statusColors[event.status]}`}>
                {statusLabels[event.status]}
              </Badge>
              {statusAction && (
                <Button
                  size="default"
                  variant={statusAction === "activate" ? "default" : "destructive"}
                  onClick={changeStatus}
                  disabled={statusMutation.isPending}
                  className="font-semibold"
                  aria-label={statusAction === "activate" ? "Aktifkan event" : "Akhiri event"}
                >
                  {statusMutation.isPending
                    ? "Menyimpan..."
                    : statusAction === "activate" ? "Aktifkan event" : "Akhiri event"}
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        {statusMutation.error && (
          <p className="px-6 pb-4 text-sm text-destructive" role="alert">
            {statusMutation.error.message}
          </p>
        )}
        <CardContent className="px-6 py-6">
          <div className="grid gap-5 text-sm sm:grid-cols-2 lg:grid-cols-4">
            <div className="border-l-2 border-primary/30 pl-3">
              <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Jenis event</span>
              <p className="mt-1 font-semibold text-foreground">{eventTypeLabels[event.eventType]}</p>
            </div>
            <div className="border-l-2 border-primary/30 pl-3">
              <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Lokasi</span>
              <p className="mt-1 font-semibold text-foreground">{event.venue || "Belum ditentukan"}</p>
            </div>
            <div className="border-l-2 border-primary/30 pl-3">
              <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Waktu</span>
              <p className="mt-1 font-semibold text-foreground">
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
            <div className="border-l-2 border-primary/30 pl-3">
              <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Total foto</span>
              <p className="mt-1 font-semibold text-foreground">{event.photos.length} foto</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {statusAction === "activate" ? "Aktifkan event ini?" : "Akhiri event ini?"}
            </DialogTitle>
            <DialogDescription>
              {statusAction === "activate"
                ? "Tamu bisa mulai mengakses halaman event dan mengunggah foto setelah event diaktifkan."
                : "Setelah diakhiri, tamu tidak bisa mengunggah foto baru ke event ini."}
            </DialogDescription>
          </DialogHeader>
          {statusMutation.error && (
            <p className="text-sm text-destructive" role="alert">{statusMutation.error.message}</p>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsStatusDialogOpen(false)}>
              Batal
            </Button>
            <Button
              type="button"
              variant={statusAction === "activate" ? "default" : "destructive"}
              onClick={confirmStatusChange}
              disabled={statusMutation.isPending}
            >
              {statusMutation.isPending
                ? "Menyimpan..."
                : statusAction === "activate" ? "Ya, aktifkan event" : "Ya, akhiri event"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <section className="flex flex-col gap-3">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Akses tamu</h2>
          <p className="mt-1 text-sm text-muted-foreground">Bagikan QR dan link ini agar tamu bisa mengirim foto.</p>
        </div>
        <GuestAccessCard slug={event.slug} />
      </section>

      <section className="flex flex-col gap-3">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Moderasi foto</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Atur apakah foto tamu langsung tampil tanpa persetujuan manual.
          </p>
        </div>
        <Card className="border-slate-200 bg-white shadow-sm">
          <CardContent className="flex items-center justify-between gap-4 px-6 py-5">
            <div>
              <p className="font-semibold">Auto approve foto</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Foto baru langsung masuk galeri dan slideshow.
              </p>
            </div>
            <Button
              type="button"
              variant={event.settings?.autoApprove ? "default" : "outline"}
              aria-pressed={event.settings?.autoApprove === true}
              disabled={settingsMutation.isPending}
              onClick={() =>
                settingsMutation.mutate({
                  autoApprove: event.settings?.autoApprove !== true,
                })
              }
            >
              {settingsMutation.isPending
                ? "Menyimpan..."
                : event.settings?.autoApprove
                  ? "Aktif"
                  : "Nonaktif"}
            </Button>
          </CardContent>
          {settingsMutation.error && (
            <p className="px-6 pb-5 text-sm text-destructive" role="alert">
              {settingsMutation.error.message}
            </p>
          )}
        </Card>
      </section>

      <section className="flex flex-col gap-3">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Materi QR event</h2>
          <p className="mt-1 text-sm text-muted-foreground">Atur tampilan QR untuk poster atau meja registrasi.</p>
        </div>
        <SignagePanel
          eventTitle={event.title}
          eventType={event.eventType}
          eventId={event.id}
          slug={event.slug}
          initialColorPreset={event.branding?.qr?.colorPreset}
          initialLogoUrl={event.branding?.qr?.logoUrl ?? ""}
          onSave={async (qr) => {
            await brandingMutation.mutateAsync(qr);
          }}
        />
      </section>

      {/* Slideshow Panel */}
      <section className="flex flex-col gap-3">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Layar venue</h2>
          <p className="mt-1 text-sm text-muted-foreground">Kontrol foto yang sedang tampil di layar acara.</p>
        </div>
        <Card className="border-slate-200 bg-white shadow-sm">
          <CardContent className="pt-6">
            <SlideshowPanel
              eventId={event.id}
              slug={event.slug}
              intervalSec={event.settings?.slideshow?.intervalSec ?? 5}
              transition={event.settings?.slideshow?.transition ?? "fade"}
            />
          </CardContent>
        </Card>
      </section>

      {/* Pending Moderation */}
      {pendingPhotos.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold tracking-tight mb-4">
            Menunggu moderasi <span className="text-muted-foreground">({pendingPhotos.length})</span>
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
          <h3 className="text-xl font-semibold tracking-tight mb-4">
            Foto disetujui <span className="text-muted-foreground">({approvedPhotos.length})</span>
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
            Belum ada foto yang disetujui.
          </p>
        )}
      </div>
    </div>
  );
}
