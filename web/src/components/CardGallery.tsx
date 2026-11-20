import { useRef, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CardGalleryProps {
  photos: string[];
  alt: string;
  onOpen?: () => void;
  overlay?: ReactNode;
  className?: string;
}

export function CardGallery({ photos, alt, onOpen, overlay, className = "" }: CardGalleryProps) {
  const [index, setIndex] = useState(0);
  const startX = useRef(0);
  const moved = useRef(0);
  const dragging = useRef(false);
  const count = photos.length;

  function step(event: React.MouseEvent, delta: number) {
    event.preventDefault();
    event.stopPropagation();
    setIndex((current) => (current + delta + count) % count);
  }

  function onPointerDown(event: React.PointerEvent) {
    if ((event.target as HTMLElement).closest("button, a, input")) return;
    dragging.current = true;
    startX.current = event.clientX;
    moved.current = 0;
    (event.currentTarget as HTMLElement).setPointerCapture?.(event.pointerId);
  }

  function onPointerMove(event: React.PointerEvent) {
    if (!dragging.current) return;
    moved.current = event.clientX - startX.current;
  }

  function onPointerUp() {
    if (!dragging.current) return;
    dragging.current = false;
    if (Math.abs(moved.current) > 45 && count > 1) {
      setIndex((current) =>
        moved.current < 0
          ? (current + 1) % count
          : (current - 1 + count) % count,
      );
    }
  }

  function handleOpen(event: React.MouseEvent) {
    if ((event.target as HTMLElement).closest("button, a, input")) return;
    if (Math.abs(moved.current) > 10) {
      moved.current = 0;
      return;
    }
    onOpen?.();
  }

  if (!count) {
    return (
      <div className={`flex aspect-[4/3] items-center justify-center rounded-3xl bg-sand text-sm text-ink/40 ${className}`}>
        No photo yet
      </div>
    );
  }

  return (
    <div
      className={`group/gallery relative aspect-[4/3] touch-pan-y select-none overflow-hidden rounded-3xl bg-sand ${onOpen ? "cursor-pointer" : ""} ${className}`}
      role={onOpen ? "link" : undefined}
      tabIndex={onOpen ? 0 : undefined}
      aria-label={onOpen ? `View ${alt}` : alt}
      onClick={handleOpen}
      onKeyDown={(event) => {
        if (event.key === "Enter" && onOpen) onOpen();
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={() => {
        dragging.current = false;
      }}
    >
      <div
        className="flex h-full transition-transform duration-500 ease-out"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {photos.map((photo, i) => (
          <img
            key={`${photo}-${i}`}
            src={photo}
            alt={`${alt} — photo ${i + 1}`}
            loading="lazy"
            draggable={false}
            className="pointer-events-none h-full w-full shrink-0 object-cover"
          />
        ))}
      </div>

      {overlay}

      {count > 1 && (
        <>
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/30 via-transparent to-transparent opacity-0 transition group-hover/gallery:opacity-100" />

          <button
            type="button"
            onClick={(event) => step(event, -1)}
            className="absolute left-2 top-1/2 hidden h-8 w-8 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-ink shadow-md backdrop-blur transition hover:scale-105 sm:grid sm:opacity-0 sm:group-hover/gallery:opacity-100"
            aria-label="Previous photo"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            type="button"
            onClick={(event) => step(event, 1)}
            className="absolute right-2 top-1/2 hidden h-8 w-8 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-ink shadow-md backdrop-blur transition hover:scale-105 sm:grid sm:opacity-0 sm:group-hover/gallery:opacity-100"
            aria-label="Next photo"
          >
            <ChevronRight size={16} />
          </button>

          <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1 rounded-full bg-ink/35 px-2 py-1.5 backdrop-blur">
            {photos.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  setIndex(i);
                }}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === index ? "w-4 bg-white" : "w-1.5 bg-white/55 hover:bg-white/80"
                }`}
                aria-label={`Go to photo ${i + 1}`}
                aria-current={i === index}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
