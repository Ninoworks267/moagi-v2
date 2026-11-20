import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, MapPin, MessageSquare, Pencil, ShieldAlert, Star } from "lucide-react";
import { Avatar } from "../components/Avatar";
import { StarRow } from "../components/Stars";
import { PropertyCard } from "../components/PropertyCard";
import { EmptyState } from "../components/EmptyState";
import { PageLoader, SectionSkeleton } from "../components/Skeletons";
import { api } from "../lib/api";
import { formatDate } from "../lib/format";
import { useAuth } from "../context/AuthContext";
import type { LandlordProfile } from "../lib/types";

export default function LandlordPage() {
  const { id } = useParams();
  const { user } = useAuth();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["landlord", Number(id)],
    queryFn: () => api<LandlordProfile>(`/users/${id}`),
    enabled: Boolean(id),
  });

  if (isLoading) return <PageLoader />;
  if (isError || !data) {
    return (
      <div className="container-page py-20">
        <EmptyState
          icon={<ShieldAlert size={24} />}
          title="Profile not found"
          description="This account may no longer exist."
          action={<Link to="/houses" className="btn btn-primary">Browse homes</Link>}
        />
      </div>
    );
  }

  const { user: landlord, properties, reviews, stats, is_me } = data;

  return (
    <div className="container-page pb-14">
      <div className="py-5">
        <Link to="/houses" className="inline-flex items-center gap-1.5 text-sm text-ink/50 hover:text-forest">
          <ArrowLeft size={15} /> Back to homes
        </Link>
      </div>

      <div className="overflow-hidden rounded-[32px] bg-forest text-cream">
        <div className="relative p-7 sm:p-10">
          <div className="absolute inset-0 opacity-[0.07] [background-image:radial-gradient(circle_at_20%_20%,#fff_1px,transparent_1px),radial-gradient(circle_at_80%_60%,#fff_1px,transparent_1px)] [background-size:32px_32px]" />
          <div className="relative flex flex-wrap items-center gap-6">
            <Avatar avatarUrl={landlord.avatar_url} first={landlord.first_name} last={landlord.surname} size="xl" className="border-2 border-cream/20" />
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-gold">
                {landlord.role === "landlord" ? "Landlord profile" : "Member profile"}
              </p>
              <h1 className="mt-2 text-3xl font-semibold sm:text-4xl">{landlord.first_name} {landlord.surname}</h1>
              <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-cream/65">
                <span className="inline-flex items-center gap-1.5"><MapPin size={14} /> {landlord.location}</span>
                <span>Member since {formatDate(landlord.created_at, { month: "long", year: "numeric" })}</span>
              </p>
            </div>
            <div className="flex gap-2">
              {is_me ? (
                <Link to="/profile" className="btn btn-light"><Pencil size={15} /> Edit profile</Link>
              ) : user ? (
                <Link to={`/messages?to=${landlord.id}`} className="btn btn-clay">
                  <MessageSquare size={16} /> Message
                </Link>
              ) : (
                <Link to="/login" className="btn btn-clay">Log in to message</Link>
              )}
            </div>
          </div>

          <div className="relative mt-8 grid grid-cols-3 gap-4 border-t border-cream/15 pt-6">
            <div>
              <p className="font-display text-3xl font-semibold">{stats.listings}</p>
              <p className="mt-1 text-xs text-cream/50">Active listings</p>
            </div>
            <div>
              <p className="font-display text-3xl font-semibold">{stats.reviews}</p>
              <p className="mt-1 text-xs text-cream/50">Tenant reviews</p>
            </div>
            <div>
              <p className="flex items-center gap-1.5 font-display text-3xl font-semibold">
                {stats.rating ?? "—"} <Star size={20} className="fill-gold text-gold" />
              </p>
              <p className="mt-1 text-xs text-cream/50">Average rating</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_300px]">
        <div>
          <h2 className="text-2xl font-semibold">About</h2>
          <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-ink/65">
            {landlord.bio || "This member has not added a bio yet."}
          </p>

          <div className="mt-10 flex items-end justify-between">
            <h2 className="text-2xl font-semibold">Listings</h2>
            <span className="text-xs text-ink/40">{properties.length} active</span>
          </div>
          {properties.length === 0 ? (
            <p className="mt-4 rounded-2xl bg-white p-5 text-sm text-ink/45 ring-1 ring-ink/8">
              No active listings right now.
            </p>
          ) : (
            <div className="mt-5 grid gap-x-6 gap-y-10 sm:grid-cols-2">
              {properties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          )}

          <div className="mt-12">
            <h2 className="text-2xl font-semibold">Tenant reviews</h2>
            {reviews.length === 0 ? (
              <p className="mt-4 rounded-2xl bg-white p-5 text-sm text-ink/45 ring-1 ring-ink/8">
                No reviews yet.
              </p>
            ) : (
              <div className="mt-5 space-y-4">
                {reviews.map((review) => (
                  <div key={review.id} className="rounded-3xl border border-ink/10 bg-white p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <Avatar avatarUrl={review.author.avatar_url} first={review.author.first_name} last={review.author.surname} size="md" />
                        <div>
                          <p className="text-sm font-semibold">{review.author.first_name} {review.author.surname}</p>
                          <p className="text-xs text-ink/40">{formatDate(review.created_at)}</p>
                        </div>
                      </div>
                      <StarRow rating={review.rating} />
                    </div>
                    <p className="mt-3 text-sm leading-relaxed text-ink/65">{review.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <aside>
          <div className="sticky top-32 space-y-4">
            <div className="rounded-3xl bg-mist p-5">
              <p className="text-sm font-semibold text-forest">Working with {landlord.first_name}</p>
              <ul className="mt-3 space-y-2 text-xs leading-relaxed text-ink/60">
                <li>View the home before paying any deposit.</li>
                <li>Ask about water, electricity and lease terms up front.</li>
                <li>Keep all messages on MOAGI for your records.</li>
              </ul>
            </div>
            {!is_me && (
              <Link
                to={user ? `/reports?user=${landlord.id}` : "/login"}
                className="flex items-center justify-center gap-2 rounded-2xl border border-ink/10 bg-white p-4 text-xs font-medium text-ink/45 transition hover:text-clay"
              >
                <ShieldAlert size={14} /> Report this member
              </Link>
            )}
          </div>
        </aside>
      </div>

      {properties.length === 0 && <SectionSkeleton count={0} />}
    </div>
  );
}
