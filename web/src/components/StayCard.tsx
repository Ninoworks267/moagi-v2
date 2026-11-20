import { Link, useNavigate } from "react-router-dom";
import { MapPin, Users } from "lucide-react";
import type { Stay } from "../lib/types";
import { money } from "../lib/format";
import { Stars } from "./Stars";
import { CardGallery } from "./CardGallery";

export function StayCard({ stay }: { stay: Stay }) {
  const navigate = useNavigate();
  return (
    <article className="group flex flex-col">
      <CardGallery
        photos={stay.photos ?? []}
        alt={stay.title}
        onOpen={() => navigate(`/stays/${stay.id}`)}
        overlay={
          <>
            <span className="pointer-events-none absolute left-3 top-3 z-10 rounded-full bg-cream/95 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-forest shadow-sm">
              {stay.stay_type}
            </span>
            <span className="pointer-events-none absolute bottom-3 left-3 z-10 rounded-full bg-white/95 px-2.5 py-1 shadow-sm backdrop-blur">
              <Stars rating={stay.rating} size={13} />
            </span>
          </>
        }
      />
      <div className="px-1 pt-4">
        <div className="flex items-start justify-between gap-3">
          <Link to={`/stays/${stay.id}`} className="min-w-0">
            <h3 className="line-clamp-2 text-[17px] font-semibold transition group-hover:text-forest">{stay.title}</h3>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-ink/55">
              <MapPin size={13} /> {stay.location}
            </p>
          </Link>
          <div className="shrink-0 text-right">
            <p className="font-display text-xl font-semibold text-forest">{money(stay.price)}</p>
            <p className="text-[11px] text-ink/45">per night</p>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2 border-t border-ink/8 pt-3 text-xs text-ink/55">
          <Users size={14} /> Up to {stay.guests} guests
          <span className="ml-auto">{stay.review_count} reviews</span>
        </div>
      </div>
    </article>
  );
}
