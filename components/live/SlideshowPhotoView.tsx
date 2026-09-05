import type { Photo, SlideshowTransition } from "@/lib/types";

export function transitionClass(transition: SlideshowTransition): string {
  switch (transition) {
    case "slide":
      return "animate-in slide-in-from-right-40 duration-500";
    case "zoom":
      return "animate-in zoom-in-75 duration-500";
    case "fade":
    default:
      return "animate-in fade-in duration-700";
  }
}

interface SlideshowPhotoViewProps {
  photo: Photo;
  showMessages: boolean;
  transition: SlideshowTransition;
}

export default function SlideshowPhotoView({
  photo,
  showMessages,
  transition,
}: SlideshowPhotoViewProps) {
  return (
    <div className="relative h-full w-full bg-black">
      <img
        key={photo.id}
        src={photo.fileUrl}
        alt="Foto slideshow"
        className={`h-full w-full object-contain ${transitionClass(transition)}`}
      />
      {showMessages && (photo.message || photo.guestName) && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-6 pb-8 pt-16 text-white">
          {photo.guestName && (
            <p className="text-lg font-semibold">{photo.guestName}</p>
          )}
          {photo.message && <p className="mt-1 text-2xl">{photo.message}</p>}
        </div>
      )}
    </div>
  );
}
