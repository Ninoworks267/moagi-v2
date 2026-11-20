import { Star } from "lucide-react";

export function Stars({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <span className="inline-flex items-center gap-1 text-ink">
      <Star size={size} className="fill-gold text-gold" />
      <span className="text-sm font-semibold">{rating.toFixed(1)}</span>
    </span>
  );
}

export function StarRow({ rating, size = 16 }: { rating: number; size?: number }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={size}
          className={n <= Math.round(rating) ? "fill-gold text-gold" : "text-ink/20"}
        />
      ))}
    </span>
  );
}
