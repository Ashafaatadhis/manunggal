import { db } from "@/lib/db";
import { toPhoto } from "@/lib/mappers";
import { readSlideshowConfig } from "@/lib/slideshow";
import SlideshowStage from "@/components/live/SlideshowStage";

export default async function LiveSlideshowPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const event = await db.orm.public.Event.where((e) => e.slug.eq(slug))
    .select("id", "slug", "title", "status", "settings")
    .first();

  if (!event || event.status === "draft") {
    return (
      <div className="flex h-full items-center justify-center text-white">
        <p>Event tidak ditemukan</p>
      </div>
    );
  }

  const rows = await db.orm.public.Photo.where((p) => p.eventId.eq(event.id))
    .where((p) => p.status.eq("approved"))
    .orderBy((p) => p.uploadedAt.desc())
    .limit(500)
    .all();

  return (
    <SlideshowStage
      slug={slug}
      title={event.title}
      eventId={event.id}
      initialPhotos={rows.map(toPhoto)}
      initialConfig={readSlideshowConfig(event.settings)}
    />
  );
}
