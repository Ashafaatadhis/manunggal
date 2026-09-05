interface SlideshowControlsProps {
  isPlaying: boolean;
  onTogglePlay: () => void;
  onPrev: () => void;
  onNext: () => void;
  onStop: () => void;
}

export default function SlideshowControls({
  isPlaying,
  onTogglePlay,
  onPrev,
  onNext,
  onStop,
}: SlideshowControlsProps) {
  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={onPrev}
        aria-label="Foto sebelumnya"
        className="rounded-full bg-white/20 p-3 text-white backdrop-blur transition hover:bg-white/40"
      >
        ←
      </button>
      <button
        type="button"
        onClick={onTogglePlay}
        aria-label={isPlaying ? "Jeda" : "Putar"}
        className="rounded-full bg-white/20 p-3 text-white backdrop-blur transition hover:bg-white/40"
      >
        {isPlaying ? "⏸" : "▶"}
      </button>
      <button
        type="button"
        onClick={onNext}
        aria-label="Foto berikutnya"
        className="rounded-full bg-white/20 p-3 text-white backdrop-blur transition hover:bg-white/40"
      >
        →
      </button>
      <button
        type="button"
        onClick={onStop}
        aria-label="Berhenti"
        className="rounded-full bg-red-500/30 p-3 text-white backdrop-blur transition hover:bg-red-500/50"
      >
        ⏹
      </button>
    </div>
  );
}