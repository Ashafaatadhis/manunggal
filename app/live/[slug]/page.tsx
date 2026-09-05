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

  const event = await db.event.findUnique({
    where: { slug },
    select: { id: true, slug: true, title: true, status: true, settings: true },
  });

  if (!event || event.status === "draft") {
    return (
      <div className="flex h-full items-center justify-center text-white">
        <p>Event tidak ditemukan</p>
      </div>
    );
  }

  const rows = await db.photo.findMany({
    where: { eventId: event.id, status: "approved" },
    orderBy: { uploadedAt: "desc" },
    take: 500,
  });

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
