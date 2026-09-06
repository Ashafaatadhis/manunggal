import { db } from "@/lib/db";
import LiveFeed from "@/components/guest/LiveFeed";
import { toPhoto } from "@/lib/mappers";

export default async function FeedPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const event = await db.orm.public.Event.where((e) => e.slug.eq(slug))
    .select("id", "title")
    .first();

  if (!event) {
    return (
      <div className="min-h-screen bg-cream-100 flex items-center justify-center">
        <p className="text-muted-foreground">Event tidak ditemukan</p>
      </div>
    );
  }

  const rows = await db.orm.public.Photo.where((p) => p.eventId.eq(event.id))
    .where((p) => p.status.eq("approved"))
    .orderBy((p) => p.uploadedAt.desc())
    .limit(100)
    .all();

  const photos = rows.map(toPhoto);

  return <LiveFeed slug={slug} initialPhotos={photos} />;
}
