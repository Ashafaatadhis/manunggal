import { db } from "@/lib/db";
import LiveFeed from "@/components/guest/LiveFeed";
import { toPhoto } from "@/lib/mappers";

export default async function FeedPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const event = await db.event.findUnique({
    where: { slug },
    select: { id: true, title: true },
  });

  if (!event) {
    return (
      <div className="min-h-screen bg-cream-100 flex items-center justify-center">
        <p className="text-muted-foreground">Event tidak ditemukan</p>
      </div>
    );
  }

  const rows = await db.photo.findMany({
    where: {
      eventId: event.id,
      status: "approved",
    },
    orderBy: { uploadedAt: "desc" },
    take: 100,
  });

  const photos = rows.map(toPhoto);

  return <LiveFeed slug={slug} initialPhotos={photos} />;
}
