import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Images, X } from "lucide-react";

export function ImageGallery({ photos, title }: { photos: string[]; title: string }) {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
      if (event.key === "ArrowRight") setIndex((i) => (i + 1) % photos.length);
      if (event.key === "ArrowLeft") setIndex((i) => (i - 1 + photos.length) % photos.length);
    }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, photos.length]);

  if (!photos.length) {
    return <div className="skeleton aspect-[16/9] w-full rounded-3xl" />;
  }

  const shown = photos.slice(0, 3);

  return (
    <>
      <div className="grid gap-2 overflow-hidden rounded-3xl sm:grid-cols-4 sm:grid-rows-2">
        {shown.map((photo, i) => (
          <button
            key={`${photo}-${i}`}
            onClick={() => {
              setIndex(i);
              setOpen(true);
            }}
            className={`group relative overflow-hidden bg-sand ${
              i === 0
                ? "aspect-[4/3] sm:col-span-2 sm:row-span-2 sm:aspect-auto sm:h-full"
                : "aspect-[4/3] sm:col-span-2 sm:aspect-auto sm:h-full"
            }`}
          >
            <img
              src={photo}
              alt={`${title} — photo ${i + 1}`}
              className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.03]"
            />
            {i === 2 && photos.length > 3 && (
              <span className="absolute inset-0 flex items-center justify-center gap-2 bg-ink/45 text-sm font-semibold text-cream backdrop-blur-[1px]">
                <Images size={17} /> +{photos.length - 3} photos
              </span>
            )}
            {i === 1 && photos.length > 3 && (
              <span className="absolute inset-0 bg-ink/10 opacity-0 transition group-hover:opacity-100" />
            )}
          </button>
        ))}
      </div>

      {open && (
        <div className="animate-fade-in fixed inset-0 z-[100] flex flex-col bg-ink/95 backdrop-blur">
          <div className="flex items-center justify-between px-5 py-4 text-cream">
            <p className="text-sm text-cream/70">
              {index + 1} / {photos.length}
            </p>
            <button
              onClick={() => setOpen(false)}
              className="grid h-10 w-10 place-items-center rounded-full bg-white/10 transition hover:bg-white/20"
              aria-label="Close gallery"
            >
              <X size={20} />
            </button>
          </div>
          <div className="relative flex flex-1 items-center justify-center overflow-hidden px-4">
            <button
              onClick={() => setIndex((i) => (i - 1 + photos.length) % photos.length)}
              className="absolute left-4 z-10 grid h-11 w-11 place-items-center rounded-full bg-white/10 text-cream backdrop-blur transition hover:bg-white/20"
              aria-label="Previous photo"
            >
              <ChevronLeft size={22} />
            </button>
            <img
              key={photos[index]}
              src={photos[index]}
              alt={`${title} — photo ${index + 1}`}
              className="max-h-[76vh] w-auto max-w-full rounded-xl object-contain shadow-2xl"
            />
            <button
              onClick={() => setIndex((i) => (i + 1) % photos.length)}
              className="absolute right-4 z-10 grid h-11 w-11 place-items-center rounded-full bg-white/10 text-cream backdrop-blur transition hover:bg-white/20"
              aria-label="Next photo"
            >
              <ChevronRight size={22} />
            </button>
          </div>
          <div className="no-scrollbar flex gap-2 overflow-x-auto p-4">
            {photos.map((photo, i) => (
              <button
                key={`${photo}-thumb`}
                onClick={() => setIndex(i)}
                className={`h-16 w-24 shrink-0 overflow-hidden rounded-lg border-2 transition ${
                  i === index ? "border-gold" : "border-transparent opacity-60 hover:opacity-100"
                }`}
              >
                <img src={photo} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
