"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import NameInput from "@/components/guest/NameInput";
import type { Event, ApiResponse } from "@/lib/types";

export default function GuestLandingPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [guestName, setGuestName] = useState<string | null>(null);

  useEffect(() => {
    async function fetchEvent() {
      try {
        const res = await fetch(`/api/events/${slug}`);
        const data: ApiResponse<Event> = await res.json();
        if (data.success && data.data) {
          setEvent(data.data);
        } else {
          setError(data.error?.message || "Gagal memuat acara");
        }
      } catch {
        setError("Gagal memuat acara");
      } finally {
        setLoading(false);
      }
    }
    fetchEvent();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-cream-100 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-cream-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Oops!</h1>
          <p className="text-muted-foreground">{error || "Event tidak ditemukan"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream-100 py-12 px-4">
      <div className="max-w-sm mx-auto text-center">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            {event.title}
          </h1>
          <p className="text-muted-foreground">
            {new Date(event.date).toLocaleDateString("id-ID", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm mb-8">
          <NameInput onNameSet={setGuestName} />
        </div>

        {guestName && (
          <div className="space-y-4">
            <button
              onClick={() => router.push(`/g/${slug}/camera`)}
              className="w-full bg-primary text-primary-foreground py-4 rounded-xl text-lg font-medium hover:bg-primary/90 transition-colors"
            >
              📸 Mulai Motret
            </button>
            <button
              onClick={() => router.push(`/g/${slug}/upload`)}
              className="w-full bg-white text-foreground py-4 rounded-xl text-lg font-medium border border-border hover:bg-muted transition-colors"
            >
              🖼️ Pilih dari Galeri
            </button>
            <button
              onClick={() => router.push(`/g/${slug}/feed`)}
              className="w-full text-primary py-4 text-lg font-medium hover:text-primary/80 transition-colors"
            >
              📷 Lihat Feed
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
