import type { Photo } from "@/lib/types";

interface PhotoCardProps {
  photo: Photo;
}

export default function PhotoCard({ photo }: PhotoCardProps) {
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm">
      <img
        src={photo.fileUrl}
        alt={`Foto oleh ${photo.guestName || "Anonymous"}`}
        className="w-full aspect-square object-cover"
        loading="lazy"
      />
      <div className="p-3">
        <div className="flex items-center justify-between">
          <span className="font-medium text-foreground text-sm">
            {photo.guestName || "Anonymous"}
          </span>
          <span className="text-xs text-muted-foreground">
            {new Date(photo.uploadedAt).toLocaleTimeString("id-ID", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
        {photo.message && (
          <p className="text-sm text-muted-foreground mt-2">{photo.message}</p>
        )}
      </div>
    </div>
  );
}
