import { db } from "@/lib/db";
import LiveFeed from "@/components/guest/LiveFeed";
import type { Photo } from "@/lib/types";

export default async function FeedPage({
  params,
}: {
  params: { slug: string };
}) {
  const event = await db.event.findUnique({
    where: { slug: params.slug },
    select: { id: true, title: true },
  });

  if (!event) {
    return (
      <div className="min-h-screen bg-cream-100 flex items-center justify-center">
        <p className="text-muted-foreground">Event tidak ditemukan</p>
      </div>
    );
  }

  const photos: Photo[] = await db.photo.findMany({
    where: {
      eventId: event.id,
      status: "approved",
    },
    orderBy: { uploadedAt: "desc" },
    take: 100,
  });

  return <LiveFeed eventId={event.id} initialPhotos={photos} />;
}
