import { useMemo, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  ArrowRight,
  Bath,
  BedDouble,
  CalendarDays,
  Car,
  Check,
  Droplets,
  Heart,
  Home,
  MapPin,
  MessageSquare,
  Pencil,
  ShieldCheck,
  Sofa,
  Star,
  Trash2,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { CategoryMark, categoryDef } from "../lib/categories";
import { ImageGallery } from "../components/ImageGallery";
import { Avatar } from "../components/Avatar";
import { StarRow } from "../components/Stars";
import { PropertyCard } from "../components/PropertyCard";
import { PageLoader, SectionSkeleton } from "../components/Skeletons";
import { EmptyState } from "../components/EmptyState";
import { StatusPill } from "../components/UI";
import { api } from "../lib/api";
import { formatDate, money, timeAgo } from "../lib/format";
import { useFavoriteToggle } from "../lib/favorites";
import { useAuth } from "../context/AuthContext";
import type { Property, PropertyList, Review } from "../lib/types";

function amenityIcon(amenity: string) {
  const value = amenity.toLowerCase();
  if (value.includes("water") || value.includes("borehole") || value.includes("tank")) return <Droplets size={16} />;
  if (value.includes("electric")) return <Zap size={16} />;
  if (value.includes("parking") || value.includes("garage") || value.includes("carport") || value.includes("boat"))
    return <Car size={16} />;
  if (value.includes("furnis") || value.includes("sofa")) return <Sofa size={16} />;
  if (value.includes("security") || value.includes("gated") || value.includes("concierge")) return <ShieldCheck size={16} />;
  if (value.includes("pet")) return <Home size={16} />;
  return <Check size={16} />;
}

export default function PropertyPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const toggleFavorite = useFavoriteToggle();
  const [message, setMessage] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const propertyQuery = useQuery({
    queryKey: ["property", Number(id)],
    queryFn: () => api<Property>(`/properties/${id}`),
    enabled: Boolean(id),
  });

  const property = propertyQuery.data;

  const reviewsQuery = useQuery({
    queryKey: ["landlord", property?.landlord.id, "reviews"],
    queryFn: () => api<Review[]>(`/users/${property?.landlord.id}/reviews`),
    enabled: Boolean(property),
  });

  const similarQuery = useQuery({
    queryKey: ["properties", "similar", property?.city],
    queryFn: () => api<PropertyList>(`/properties?city=${encodeURIComponent(property!.city)}&page_size=4`),
    enabled: Boolean(property),
  });

  const sendMessage = useMutation({
    mutationFn: () =>
      api(`/messages/${property!.landlord.id}`, { method: "POST", body: { body: message.trim() } }),
    onSuccess: () => {
      setMessage("");
      toast.success("Message sent to the landlord.");
      queryClient.invalidateQueries({ queryKey: ["unread"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const submitReview = useMutation({
    mutationFn: () =>
      api(`/users/${property!.landlord.id}/reviews`, {
        method: "POST",
        body: { rating, comment: comment.trim(), property_id: property!.id },
      }),
    onSuccess: () => {
      setComment("");
      setRating(5);
      toast.success("Your review is live. Thank you!");
      queryClient.invalidateQueries({ queryKey: ["landlord"] });
      queryClient.invalidateQueries({ queryKey: ["property"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: () => api<void>(`/properties/${property!.id}`, { method: "DELETE" }),
    onSuccess: () => {
      toast.success("Listing removed.");
      queryClient.invalidateQueries({ queryKey: ["properties"] });
      navigate("/dashboard");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const isOwner = Boolean(user && property && user.id === property.landlord.id);
  const canModerate = Boolean(user && property && (user.role === "admin" || isOwner));
  const reviews = reviewsQuery.data ?? [];
  const similar = useMemo(
    () => (similarQuery.data?.items ?? []).filter((item) => item.id !== property?.id).slice(0, 3),
    [similarQuery.data, property?.id],
  );
  const hasReviewed = Boolean(user && reviews.some((review) => review.author.id === user.id));

  function handleSend(event: FormEvent) {
    event.preventDefault();
    if (!user) {
      navigate("/login");
      return;
    }
    if (!message.trim()) return;
    sendMessage.mutate();
  }

  function handleReview(event: FormEvent) {
    event.preventDefault();
    if (!comment.trim()) return;
    submitReview.mutate();
  }

  function handleShare() {
    navigator.clipboard?.writeText(window.location.href);
    toast.success("Link copied to clipboard.");
  }

  function handleDelete() {
    if (window.confirm("Remove this listing from MOAGI? This cannot be undone.")) deleteMutation.mutate();
  }

  if (propertyQuery.isLoading) return <PageLoader />;
  if (propertyQuery.isError || !property) {
    return (
      <div className="container-page py-20">
        <EmptyState
          icon={<Home size={24} />}
          title="This home isn't available"
          description="The listing may have been removed or the link is incorrect."
          action={<Link to="/houses" className="btn btn-primary">Browse homes</Link>}
        />
      </div>
    );
  }

  return (
    <div className="container-page pb-10">
      <div className="flex items-center justify-between gap-3 py-5">
        <Link to="/houses" className="inline-flex items-center gap-1.5 text-sm font-medium text-ink/55 transition hover:text-forest">
          <ArrowLeft size={16} /> All homes
        </Link>
        <div className="flex gap-2">
          <button onClick={handleShare} className="btn btn-ghost btn-sm">Share</button>
          <button onClick={() => toggleFavorite(property)} className="btn btn-ghost btn-sm">
            <Heart size={14} className={property.is_favorite ? "fill-clay text-clay" : ""} />
            {property.is_favorite ? "Saved" : "Save"}
          </button>
        </div>
      </div>

      <ImageGallery photos={property.photos} title={property.title} />

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_360px]">
        <div className="min-w-0">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="chip">{property.property_type}</span>
                {(() => {
                  const category = categoryDef(property.category);
                  return category ? (
                    <span className="chip inline-flex items-center gap-1.5">
                      <CategoryMark category={category} size={12} /> {category.label}
                    </span>
                  ) : null;
                })()}
                {property.featured && <span className="chip border-gold/40 bg-gold/10 text-[#8a6414]">Featured</span>}
                {property.status !== "active" && <StatusPill status={property.status} />}
              </div>
              <h1 className="mt-4 text-balance text-3xl font-semibold leading-tight sm:text-4xl">{property.title}</h1>
              <p className="mt-3 flex items-center gap-2 text-sm text-ink/55">
                <MapPin size={15} /> {property.location}
                {property.review_rating !== null && (
                  <span className="ml-2 inline-flex items-center gap-1 border-l border-ink/15 pl-3">
                    <Star size={14} className="fill-gold text-gold" />
                    <b className="text-ink">{property.review_rating}</b>
                    <span className="text-ink/40">({property.review_count})</span>
                  </span>
                )}
              </p>
            </div>
            <div className="text-right">
              <p className="font-display text-4xl font-semibold text-forest">{money(property.price)}</p>
              <p className="text-xs text-ink/45">per month</p>
            </div>
          </div>

          <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { icon: <BedDouble size={18} />, label: `${property.bedrooms} bedrooms` },
              { icon: <Bath size={18} />, label: `${property.bathrooms} bathrooms` },
              { icon: <Sofa size={18} />, label: property.furnished ? "Furnished" : "Unfurnished" },
              { icon: <Car size={18} />, label: property.parking ? "Parking" : "No parking" },
            ].map((spec) => (
              <div key={spec.label} className="flex items-center gap-2.5 rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm text-ink/70">
                <span className="text-forest">{spec.icon}</span>
                {spec.label}
              </div>
            ))}
          </div>

          <div className="mt-10">
            <h2 className="text-2xl font-semibold">About this home</h2>
            <p className="mt-4 whitespace-pre-line text-[15px] leading-[1.8] text-ink/65">{property.description}</p>
          </div>

          <div className="mt-10">
            <h2 className="text-2xl font-semibold">What's included</h2>
            <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
              {property.amenities.map((amenity) => (
                <div key={amenity} className="flex items-center gap-3 rounded-xl bg-white px-4 py-3 text-sm text-ink/70 ring-1 ring-ink/8">
                  <span className="text-forest">{amenityIcon(amenity)}</span>
                  {amenity}
                </div>
              ))}
              {property.water_included && (
                <div className="flex items-center gap-3 rounded-xl bg-white px-4 py-3 text-sm text-ink/70 ring-1 ring-ink/8">
                  <Droplets size={16} className="text-forest" /> Water included
                </div>
              )}
              {property.electricity_included && (
                <div className="flex items-center gap-3 rounded-xl bg-white px-4 py-3 text-sm text-ink/70 ring-1 ring-ink/8">
                  <Zap size={16} className="text-forest" /> Electricity included
                </div>
              )}
              {property.amenities.length === 0 && !property.water_included && !property.electricity_included && (
                <p className="text-sm text-ink/45">The landlord hasn't listed amenities yet.</p>
              )}
            </div>
          </div>

          <div className="mt-10 grid gap-4 rounded-3xl bg-sand p-6 sm:grid-cols-3">
            <div>
              <p className="text-xs uppercase tracking-[0.14em] text-ink/45">Deposit</p>
              <p className="mt-1.5 font-display text-xl font-semibold text-forest">
                {property.deposit > 0 ? money(property.deposit) : "Monthly rent"}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.14em] text-ink/45">Available</p>
              <p className="mt-1.5 font-display text-xl font-semibold text-forest">
                {property.available_from || "Ask landlord"}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.14em] text-ink/45">Utilities</p>
              <p className="mt-1.5 text-sm font-medium text-ink/70">
                {[property.water_included && "Water", property.electricity_included && "Electricity"]
                  .filter(Boolean)
                  .join(" + ") || "Tenant's account"}
              </p>
            </div>
          </div>

          <div className="mt-10">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Location</h2>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(property.location + ", Botswana")}`}
                target="_blank"
                rel="noreferrer"
                className="link-underline text-sm"
              >
                Open in Maps <ArrowRight size={14} />
              </a>
            </div>
            <div className="relative mt-4 flex h-56 items-end overflow-hidden rounded-3xl bg-[radial-gradient(circle_at_30%_40%,#dfe9e1,transparent_50%),radial-gradient(circle_at_70%_60%,#e8dfcd,transparent_55%)] p-6 ring-1 ring-ink/10">
              <div className="absolute inset-0 opacity-40 [background-image:linear-gradient(#123d2c22_1px,transparent_1px),linear-gradient(90deg,#123d2c22_1px,transparent_1px)] [background-size:38px_38px]" />
              <div className="relative z-10">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-forest px-3 py-1.5 text-xs font-semibold text-cream">
                  <MapPin size={13} /> {property.location}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-12">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold">Tenant reviews</h2>
                <p className="mt-1 text-sm text-ink/50">Reviews are for the landlord, not just this listing.</p>
              </div>
              {reviews.length > 0 && (
                <div className="text-right">
                  <StarRow rating={reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length} />
                  <p className="mt-1 text-xs text-ink/45">{reviews.length} reviews</p>
                </div>
              )}
            </div>

            {user?.role === "tenant" && !isOwner && !hasReviewed && (
              <form onSubmit={handleReview} className="mt-5 rounded-3xl border border-ink/10 bg-white p-5">
                <p className="text-sm font-semibold">Share your experience with this landlord</p>
                <div className="mt-3 flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setRating(value)}
                      aria-label={`${value} stars`}
                    >
                      <Star size={22} className={value <= rating ? "fill-gold text-gold" : "text-ink/20"} />
                    </button>
                  ))}
                  <span className="ml-1 text-sm text-ink/50">{rating} of 5</span>
                </div>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="input mt-3 min-h-24"
                  placeholder="What was it like renting from this landlord?"
                  maxLength={1000}
                  required
                />
                <button className="btn btn-primary btn-sm mt-3" disabled={submitReview.isPending}>
                  {submitReview.isPending ? "Posting…" : "Post review"}
                </button>
              </form>
            )}

            {!user && (
              <p className="mt-4 rounded-2xl bg-white p-4 text-sm text-ink/55 ring-1 ring-ink/8">
                <Link to="/login" className="font-semibold text-forest hover:underline">Log in</Link> as a tenant to leave a review.
              </p>
            )}

            <div className="mt-5 space-y-4">
              {reviewsQuery.isLoading && <div className="skeleton h-28 rounded-2xl" />}
              {reviews.map((review) => (
                <div key={review.id} className="rounded-3xl border border-ink/10 bg-white p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <Avatar avatarUrl={review.author.avatar_url} first={review.author.first_name} last={review.author.surname} size="md" />
                      <div>
                        <p className="text-sm font-semibold">
                          {review.author.first_name} {review.author.surname}
                        </p>
                        <p className="text-xs text-ink/40">{timeAgo(review.created_at)}</p>
                      </div>
                    </div>
                    <StarRow rating={review.rating} />
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-ink/65">{review.comment}</p>
                </div>
              ))}
              {!reviewsQuery.isLoading && reviews.length === 0 && (
                <p className="rounded-2xl bg-white p-5 text-sm text-ink/45 ring-1 ring-ink/8">
                  No reviews yet. Be the first to share your experience.
                </p>
              )}
            </div>
          </div>
        </div>

        <aside>
          <div className="sticky top-32 space-y-4">
            <div className="rounded-3xl border border-ink/10 bg-white p-5 shadow-[0_18px_50px_-30px_rgba(13,26,19,0.4)]">
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-xs text-ink/45">Monthly rent</p>
                  <p className="font-display text-3xl font-semibold text-forest">{money(property.price)}</p>
                </div>
                <span className="chip mb-1">Pula</span>
              </div>
              <div className="mt-4 space-y-2 border-t border-ink/8 pt-4 text-sm">
                <div className="flex justify-between text-ink/60"><span>Deposit</span><span className="font-medium text-ink">{property.deposit > 0 ? money(property.deposit) : "1 month"}</span></div>
                <div className="flex justify-between text-ink/60"><span>Available</span><span className="font-medium text-ink">{property.available_from || "Now"}</span></div>
                <div className="flex justify-between text-ink/60"><span>Type</span><span className="font-medium text-ink">{property.property_type}</span></div>
              </div>

              <div className="mt-5 border-t border-ink/8 pt-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink/40">Landlord</p>
                <Link to={`/landlords/${property.landlord.id}`} className="mt-3 flex items-center gap-3">
                  <Avatar avatarUrl={property.landlord.avatar_url} first={property.landlord.first_name} last={property.landlord.surname} size="lg" />
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{property.landlord.first_name} {property.landlord.surname}</p>
                    <p className="truncate text-xs text-ink/45">{property.landlord.location}</p>
                    {property.review_rating !== null && (
                      <p className="mt-1 flex items-center gap-1 text-xs text-ink/55">
                        <Star size={12} className="fill-gold text-gold" /> {property.review_rating} · {property.review_count} reviews
                      </p>
                    )}
                  </div>
                </Link>
              </div>

              {!isOwner && (
                <form onSubmit={handleSend} className="mt-5">
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="input min-h-20"
                    placeholder={user ? "Hi, I'm interested. Is this still available?" : "Log in to message this landlord"}
                    disabled={!user}
                    maxLength={2000}
                  />
                  <button className="btn btn-primary mt-2 w-full" disabled={!user || sendMessage.isPending || !message.trim()}>
                    <MessageSquare size={16} />
                    {sendMessage.isPending ? "Sending…" : "Message landlord"}
                  </button>
                  {!user && (
                    <p className="mt-2 text-center text-xs text-ink/45">
                      <Link to="/login" className="font-semibold text-forest hover:underline">Log in</Link> or{" "}
                      <Link to="/register" className="font-semibold text-forest hover:underline">join MOAGI</Link> to start a conversation.
                    </p>
                  )}
                </form>
              )}

              {isOwner && (
                <div className="mt-5 space-y-2">
                  <Link to={`/properties/${property.id}/edit`} className="btn btn-ghost w-full">
                    <Pencil size={15} /> Edit listing
                  </Link>
                  <button onClick={handleDelete} className="btn btn-ghost w-full text-clay" disabled={deleteMutation.isPending}>
                    <Trash2 size={15} /> Remove listing
                  </button>
                </div>
              )}

              {user && !isOwner && (
                <Link to={`/reports?property=${property.id}&user=${property.landlord.id}`} className="mt-3 block text-center text-xs text-ink/40 hover:text-clay">
                  Report this listing
                </Link>
              )}
            </div>

            <div className="rounded-3xl bg-mist p-5">
              <div className="flex items-center gap-2 text-forest">
                <ShieldCheck size={18} />
                <p className="text-sm font-semibold">Rent with confidence</p>
              </div>
              <ul className="mt-3 space-y-2 text-xs leading-relaxed text-ink/55">
                <li>Always view the home before paying.</li>
                <li>Never send a deposit without a signed lease.</li>
                <li>Keep conversations inside MOAGI.</li>
              </ul>
            </div>
          </div>
        </aside>
      </div>

      {similar.length > 0 && (
        <section className="mt-20">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <p className="eyebrow">More in {property.city}</p>
              <h2 className="mt-2 text-3xl font-semibold">Similar homes</h2>
            </div>
            <Link to={`/houses?city=${property.city}`} className="link-underline text-sm">
              See all <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {similar.map((item) => (
              <PropertyCard key={item.id} property={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
