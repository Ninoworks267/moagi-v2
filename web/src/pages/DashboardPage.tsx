import { Link, Navigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  BedDouble,
  Building2,
  CalendarDays,
  Heart,
  MessageSquare,
  Plus,
  Shield,
  Star,
  Wallet,
} from "lucide-react";
import { PageHeader, StatCard, StatusPill } from "../components/UI";
import { Avatar } from "../components/Avatar";
import { PropertyCard } from "../components/PropertyCard";
import { EmptyState } from "../components/EmptyState";
import { PageLoader, SectionSkeleton } from "../components/Skeletons";
import { StarRow } from "../components/Stars";
import { api } from "../lib/api";
import { formatDate, money, timeAgo } from "../lib/format";
import type { Dashboard } from "../lib/types";

export default function DashboardPage() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => api<Dashboard>("/dashboard"),
  });

  if (isLoading) return <PageLoader />;
  if (isError || !data) {
    return (
      <div className="container-page py-20">
        <EmptyState
          icon={<Shield size={24} />}
          title="We couldn't load your dashboard"
          description="Please refresh and try again."
          action={<button onClick={() => refetch()} className="btn btn-primary">Retry</button>}
        />
      </div>
    );
  }

  if (data.user.role === "admin") return <Navigate to="/admin" replace />;

  const isLandlord = data.user.role === "landlord";
  const stats = data.stats;

  return (
    <div className="container-page pb-12">
      <PageHeader
        eyebrow={isLandlord ? "Landlord dashboard" : "Tenant dashboard"}
        title={`Hey, ${data.user.first_name}.`}
        subtitle={
          isLandlord
            ? "Manage your listings, keep an eye on reviews and stay close to your tenants."
            : "Your saved homes, bookings and conversations — all in one place."
        }
        actions={
          isLandlord ? (
            <>
              <Link to="/properties/new" className="btn btn-primary">
                <Plus size={16} /> Add a property
              </Link>
              <Link to="/messages" className="btn btn-ghost">
                <MessageSquare size={16} /> Inbox
              </Link>
            </>
          ) : (
            <>
              <Link to="/houses" className="btn btn-primary">
                Find a home <ArrowRight size={16} />
              </Link>
              <Link to="/messages" className="btn btn-ghost">
                <MessageSquare size={16} /> Inbox
              </Link>
            </>
          )
        }
      />

      <div className="mb-10 flex items-center gap-4 rounded-3xl border border-ink/10 bg-white p-5">
        <Avatar avatarUrl={data.user.avatar_url} first={data.user.first_name} last={data.user.surname} size="lg" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">
            {data.user.first_name} {data.user.surname}
          </p>
          <p className="text-xs text-ink/45">
            {data.user.email} · {data.user.location}
          </p>
        </div>
        {data.unread_messages > 0 && (
          <Link to="/messages" className="chip border-clay/30 bg-clay/8 text-clay">
            {data.unread_messages} unread message{data.unread_messages === 1 ? "" : "s"}
          </Link>
        )}
        <Link to="/profile" className="btn btn-ghost btn-sm">Edit profile</Link>
      </div>

      {isLandlord ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Listings" value={stats.listings ?? 0} hint={`${stats.active ?? 0} active`} icon={<Building2 size={18} />} />
            <StatCard label="Reviews" value={stats.reviews ?? 0} hint={stats.rating ? `${stats.rating} average rating` : "No reviews yet"} icon={<Star size={18} />} />
            <StatCard label="Monthly value" value={money(stats.monthly_value ?? 0)} hint="Combined rent" icon={<Wallet size={18} />} />
            <StatCard label="Unread" value={data.unread_messages} hint="Messages waiting" icon={<MessageSquare size={18} />} />
          </div>

          <section className="mt-12">
            <div className="mb-5 flex items-end justify-between">
              <div>
                <p className="eyebrow">Your portfolio</p>
                <h2 className="mt-1 text-2xl font-semibold">Your listings</h2>
              </div>
              <Link to="/properties/new" className="link-underline text-sm">
                Add listing <Plus size={14} />
              </Link>
            </div>

            {data.listings.length === 0 ? (
              <EmptyState
                icon={<Building2 size={24} />}
                title="No listings yet"
                description="Add your first home and start reaching tenants across Botswana."
                action={<Link to="/properties/new" className="btn btn-primary">List a property</Link>}
              />
            ) : (
              <div className="overflow-hidden rounded-3xl border border-ink/10 bg-white">
                {data.listings.map((property) => (
                  <div
                    key={property.id}
                    className="flex flex-wrap items-center gap-4 border-b border-ink/8 p-4 last:border-0 sm:flex-nowrap"
                  >
                    <img
                      src={property.photos[0]}
                      alt={property.title}
                      className="h-16 w-24 shrink-0 rounded-xl object-cover"
                      loading="lazy"
                    />
                    <div className="min-w-0 flex-1">
                      <Link to={`/properties/${property.id}`} className="truncate font-semibold hover:text-forest">
                        {property.title}
                      </Link>
                      <p className="mt-0.5 flex items-center gap-2 text-xs text-ink/45">
                        <span>{property.location}</span>
                        <span>·</span>
                        <span className="inline-flex items-center gap-1"><BedDouble size={12} /> {property.bedrooms}</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-forest">{money(property.price)}</p>
                      <StatusPill status={property.status} />
                    </div>
                    <div className="flex gap-2">
                      <Link to={`/properties/${property.id}/edit`} className="btn btn-ghost btn-sm">Edit</Link>
                      <Link to={`/properties/${property.id}`} className="btn btn-ghost btn-sm">View</Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="mt-12">
            <p className="eyebrow">Feedback</p>
            <h2 className="mt-1 text-2xl font-semibold">Recent reviews</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {data.reviews.length === 0 && (
                <p className="rounded-2xl bg-white p-5 text-sm text-ink/45 ring-1 ring-ink/8">
                  No reviews yet. Great service tends to bring great feedback.
                </p>
              )}
              {data.reviews.map((review) => (
                <div key={review.id} className="rounded-2xl border border-ink/10 bg-white p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar avatarUrl={review.author.avatar_url} first={review.author.first_name} last={review.author.surname} size="sm" />
                      <div>
                        <p className="text-sm font-semibold">{review.author.first_name} {review.author.surname}</p>
                        <p className="text-[11px] text-ink/40">{timeAgo(review.created_at)}</p>
                      </div>
                    </div>
                    <StarRow rating={review.rating} size={14} />
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-ink/60">{review.comment}</p>
                </div>
              ))}
            </div>
          </section>
        </>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard label="Saved homes" value={stats.favorites ?? 0} hint="Homes you love" icon={<Heart size={18} />} />
            <StatCard label="Bookings" value={stats.bookings ?? 0} hint="Stays booked" icon={<CalendarDays size={18} />} />
            <StatCard label="Reviews" value={stats.reviews ?? 0} hint="Reviews written" icon={<Star size={18} />} />
          </div>

          <section className="mt-12">
            <div className="mb-5 flex items-end justify-between">
              <div>
                <p className="eyebrow">Upcoming</p>
                <h2 className="mt-1 text-2xl font-semibold">Your bookings</h2>
              </div>
              <Link to="/stays" className="link-underline text-sm">Book a stay <ArrowRight size={14} /></Link>
            </div>
            {data.bookings.length === 0 ? (
              <EmptyState
                icon={<CalendarDays size={24} />}
                title="No bookings yet"
                description="Weekend away? Work trip? Find a stay that fits."
                action={<Link to="/stays" className="btn btn-primary">Explore stays</Link>}
              />
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {data.bookings.map((booking) => (
                  <div key={booking.id} className="overflow-hidden rounded-3xl border border-ink/10 bg-white">
                    <div className="flex gap-4 p-4">
                      <img src={booking.stay.photos[0]} alt={booking.stay.title} className="h-24 w-28 shrink-0 rounded-2xl object-cover" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold">{booking.stay.title}</p>
                        <p className="mt-0.5 text-xs text-ink/45">{booking.stay.location}</p>
                        <p className="mt-2 flex items-center gap-1.5 text-xs text-ink/60">
                          <CalendarDays size={13} />
                          {formatDate(booking.checkin, { day: "numeric", month: "short" })} → {formatDate(booking.checkout, { day: "numeric", month: "short", year: "numeric" })}
                        </p>
                        <div className="mt-2 flex items-center justify-between">
                          <span className="text-sm font-semibold text-forest">{money(booking.total)}</span>
                          <StatusPill status={booking.status} />
                        </div>
                      </div>
                    </div>
                    <div className="border-t border-ink/8 bg-cream/60 px-4 py-2.5 text-[11px] text-ink/45">
                      Ref {booking.reference} · {booking.nights} night{booking.nights === 1 ? "" : "s"} · {booking.guests} guests
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="mt-12">
            <div className="mb-5 flex items-end justify-between">
              <div>
                <p className="eyebrow">Your shortlist</p>
                <h2 className="mt-1 text-2xl font-semibold">Saved homes</h2>
              </div>
              <Link to="/favorites" className="link-underline text-sm">View all <ArrowRight size={14} /></Link>
            </div>
            {data.favorites.length === 0 ? (
              <EmptyState
                icon={<Heart size={24} />}
                title="Nothing saved yet"
                description="Tap the heart on any home to keep it here for later."
                action={<Link to="/houses" className="btn btn-primary">Browse homes</Link>}
              />
            ) : (
              <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
                {data.favorites.slice(0, 3).map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
            )}
          </section>

          {data.reviews.length > 0 && (
            <section className="mt-12">
              <p className="eyebrow">Your voice</p>
              <h2 className="mt-1 text-2xl font-semibold">Reviews you've written</h2>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                {data.reviews.map((review) => (
                  <div key={review.id} className="rounded-2xl border border-ink/10 bg-white p-5">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-ink/45">{formatDate(review.created_at)}</p>
                      <StarRow rating={review.rating} size={14} />
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-ink/65">{review.comment}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      )}

      {data.listings.length > 0 && isLandlord && (
        <div className="mt-8 text-center text-xs text-ink/40">
          <SectionSkeleton count={0} />
          Tip: add at least three photos and a detailed description to get more enquiries.
        </div>
      )}
    </div>
  );
}
