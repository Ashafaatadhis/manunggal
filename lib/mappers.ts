import type { Photo, PhotoMetadata } from "./types";

/**
 * Maps a Prisma Photo row (metadata typed as JsonValue) to the app Photo
 * shape (metadata: PhotoMetadata). The metadata column stores only plain
 * objects written by our own upload handlers, so the cast is safe.
 */
export function toPhoto(row: {
  id: string;
  eventId: string;
  fileKey: string;
  fileUrl: string;
  fileProvider: Photo["fileProvider"];
  thumbnailUrl: string;
  guestName: string | null;
  guestIp: string | null;
  message: string | null;
  status: Photo["status"];
  metadata: unknown;
  uploadedAt: Date;
  moderatedAt: Date | null;
}): Photo {
  const metadata = row.metadata as PhotoMetadata;
  return {
    id: row.id,
    eventId: row.eventId,
    fileKey: row.fileKey,
    fileUrl: row.fileUrl,
    fileProvider: row.fileProvider,
    thumbnailUrl: row.thumbnailUrl,
    guestName: row.guestName ?? undefined,
    guestIp: row.guestIp ?? undefined,
    message: row.message ?? undefined,
    status: row.status,
    metadata: typeof metadata === "object" && metadata !== null ? metadata : {},
    uploadedAt: row.uploadedAt,
    moderatedAt: row.moderatedAt,
  };
}
