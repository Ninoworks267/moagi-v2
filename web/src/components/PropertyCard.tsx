import { Link, useNavigate } from "react-router-dom";
import { Bath, BedDouble, Heart, MapPin } from "lucide-react";
import type { Property } from "../lib/types";
import { money } from "../lib/format";
import { Stars } from "./Stars";
import { CategoryMark, categoryDef } from "../lib/categories";
import { CardGallery } from "./CardGallery";
import { useFavoriteToggle } from "../lib/favorites";

export function PropertyCard({ property }: { property: Property }) {
  const toggleFavorite = useFavoriteToggle();
  const navigate = useNavigate();
  const category = categoryDef(property.category);

  return (
    <article className="group flex flex-col">
      <CardGallery
        photos={property.photos ?? []}
        alt={property.title}
        onOpen={() => navigate(`/properties/${property.id}`)}
        overlay={
          <>
            <button
              type="button"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                toggleFavorite(property);
              }}
              aria-label={property.is_favorite ? "Remove from saved" : "Save home"}
              className="absolute right-3 top-3 z-20 grid h-10 w-10 place-items-center rounded-full bg-white/90 text-ink shadow-sm backdrop-blur transition hover:scale-105 hover:text-clay"
            >
              <Heart size={18} className={property.is_favorite ? "fill-clay text-clay" : ""} />
            </button>

            {property.featured && (
              <span className="pointer-events-none absolute left-3 top-3 z-10 rounded-full bg-cream/95 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-forest shadow-sm">
                Featured
              </span>
            )}

            {property.review_rating !== null && (
              <span className="pointer-events-none absolute bottom-3 left-3 z-10 rounded-full bg-white/95 px-2.5 py-1 shadow-sm backdrop-blur">
                <Stars rating={property.review_rating} size={13} />
              </span>
            )}
          </>
        }
      />

      <div className="flex flex-1 flex-col px-1 pt-4">
        <div className="flex items-start justify-between gap-3">
          <Link to={`/properties/${property.id}`} className="min-w-0">
            <h3 className="line-clamp-2 text-[17px] font-semibold leading-snug transition group-hover:text-forest">
              {property.title}
            </h3>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-ink/55">
              <MapPin size={13} /> {property.location}
            </p>
          </Link>
          <div className="shrink-0 text-right">
            <p className="font-display text-xl font-semibold text-forest">{money(property.price)}</p>
            <p className="text-[11px] text-ink/45">per month</p>
          </div>
        </div>

        <div className="mt-3 flex items-center gap-4 border-t border-ink/8 pt-3 text-xs text-ink/55">
          <span className="inline-flex items-center gap-1.5">
            <BedDouble size={14} /> {property.bedrooms} bed
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Bath size={14} /> {property.bathrooms} bath
          </span>
          <span className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-mist px-2.5 py-1 font-medium text-forest">
            {category ? (
              <>
                <CategoryMark category={category} size={12} /> {category.label}
              </>
            ) : (
              property.property_type
            )}
          </span>
        </div>
      </div>
    </article>
  );
}
