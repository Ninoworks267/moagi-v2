import { useMemo, useState, type FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  BedDouble,
  Check,
  CheckCircle2,
  MapPin,
  Phone,
  ShieldCheck,
  Smartphone,
  Users,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";
import { ImageGallery } from "../components/ImageGallery";
import { StarRow } from "../components/Stars";
import { PageLoader } from "../components/Skeletons";
import { EmptyState } from "../components/EmptyState";
import { api } from "../lib/api";
import { money, nightsBetween, todayISO } from "../lib/format";
import { useAuth } from "../context/AuthContext";
import type { Booking, Stay } from "../lib/types";

const METHODS = [
  { name: "MyZaka", note: "Mascom" },
  { name: "Orange Money", note: "Orange" },
  { name: "Smega", note: "Botswana Post" },
];

export default function StayPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [checkin, setCheckin] = useState(todayISO(1));
  const [checkout, setCheckout] = useState(todayISO(3));
  const [guests, setGuests] = useState(1);
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [method, setMethod] = useState("MyZaka");
  const [confirmation, setConfirmation] = useState<Booking | null>(null);

  const stayQuery = useQuery({
    queryKey: ["stay", Number(id)],
    queryFn: () => api<Stay>(`/stays/${id}`),
    enabled: Boolean(id),
  });

  const stay = stayQuery.data;
  const nights = useMemo(() => nightsBetween(checkin, checkout), [checkin, checkout]);
  const total = stay ? nights * stay.price : 0;

  const booking = useMutation({
    mutationFn: () =>
      api<Booking>("/bookings", {
        method: "POST",
        body: { stay_id: stay!.id, checkin, checkout, guests, phone, method },
      }),
    onSuccess: (data) => {
      setConfirmation(data);
      toast.success("Booking confirmed. Check your inbox for details.");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!user) {
      toast("Please log in to book this stay.");
      return;
    }
    if (nights < 1) {
      toast.error("Check-out must be after check-in.");
      return;
    }
    booking.mutate();
  }

  if (stayQuery.isLoading) return <PageLoader />;
  if (stayQuery.isError || !stay) {
    return (
      <div className="container-page py-20">
        <EmptyState
          icon={<BedDouble size={24} />}
          title="Stay not found"
          description="This stay may no longer be available."
          action={<Link to="/stays" className="btn btn-primary">Browse stays</Link>}
        />
      </div>
    );
  }

  return (
    <div className="container-page pb-10">
      <div className="py-5">
        <Link to="/stays" className="inline-flex items-center gap-1.5 text-sm font-medium text-ink/55 transition hover:text-forest">
          <ArrowLeft size={16} /> All stays
        </Link>
      </div>

      <ImageGallery photos={stay.photos} title={stay.title} />

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_380px]">
        <div>
          <span className="chip">{stay.stay_type}</span>
          <h1 className="mt-4 text-balance text-3xl font-semibold leading-tight sm:text-4xl">{stay.title}</h1>
          <p className="mt-3 flex items-center gap-2 text-sm text-ink/55">
            <MapPin size={15} /> {stay.location}
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-ink/60">
            <span className="inline-flex items-center gap-1.5">
              <StarRow rating={stay.rating} size={15} />
              <b className="text-ink">{stay.rating}</b> ({stay.review_count} reviews)
            </span>
            <span className="inline-flex items-center gap-1.5"><Users size={15} /> Up to {stay.guests} guests</span>
            <span className="inline-flex items-center gap-1.5"><BedDouble size={15} /> {stay.bedrooms} bedrooms</span>
          </div>

          <div className="mt-8 border-t border-ink/10 pt-8">
            <h2 className="text-2xl font-semibold">About this stay</h2>
            <p className="mt-4 text-[15px] leading-[1.8] text-ink/65">{stay.description}</p>
          </div>

          <div className="mt-8 border-t border-ink/10 pt-8">
            <h2 className="text-2xl font-semibold">What's included</h2>
            <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
              {stay.amenities.map((amenity) => (
                <div key={amenity} className="flex items-center gap-3 rounded-xl bg-white px-4 py-3 text-sm text-ink/70 ring-1 ring-ink/8">
                  <Check size={16} className="text-forest" /> {amenity}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 rounded-3xl bg-mist p-6">
            <div className="flex items-center gap-2 text-forest">
              <ShieldCheck size={19} />
              <p className="font-semibold">Good to know</p>
            </div>
            <ul className="mt-3 space-y-2 text-sm leading-relaxed text-ink/60">
              <li>Check-in from 14:00, check-out by 10:00.</li>
              <li>Bring a valid ID for the guest register.</li>
              <li>Free cancellation up to 48 hours before check-in.</li>
            </ul>
          </div>
        </div>

        <aside>
          <div className="sticky top-32">
            <div className="rounded-3xl border border-ink/10 bg-white p-5 shadow-[0_18px_50px_-30px_rgba(13,26,19,0.4)]">
              {confirmation ? (
                <div className="py-3 text-center">
                  <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-forest/10 text-forest">
                    <CheckCircle2 size={30} />
                  </div>
                  <h2 className="mt-4 font-display text-2xl font-semibold">You're booked.</h2>
                  <p className="mt-2 text-sm text-ink/55">
                    {confirmation.stay.title}
                    <br />
                    {confirmation.checkin} → {confirmation.checkout}
                  </p>
                  <div className="mt-5 space-y-2 rounded-2xl bg-cream p-4 text-left text-sm">
                    <div className="flex justify-between"><span className="text-ink/50">Reference</span><span className="font-semibold">{confirmation.reference}</span></div>
                    <div className="flex justify-between"><span className="text-ink/50">Nights</span><span className="font-semibold">{confirmation.nights}</span></div>
                    <div className="flex justify-between"><span className="text-ink/50">Paid via</span><span className="font-semibold">{confirmation.method}</span></div>
                    <div className="flex justify-between"><span className="text-ink/50">Total</span><span className="font-semibold text-forest">{money(confirmation.total)}</span></div>
                  </div>
                  <p className="mt-4 text-xs text-ink/45">
                    This is a demo payment. No money was taken.
                  </p>
                  <Link to="/dashboard" className="btn btn-primary mt-4 w-full">View my bookings</Link>
                  <button onClick={() => setConfirmation(null)} className="mt-2 text-xs text-ink/45 hover:text-forest">
                    Book another stay
                  </button>
                </div>
              ) : (
                <form onSubmit={submit}>
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="font-display text-3xl font-semibold text-forest">{money(stay.price)}</p>
                      <p className="text-xs text-ink/45">per night</p>
                    </div>
                    <span className="chip">Pula</span>
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-2">
                    <div>
                      <p className="label">Check-in</p>
                      <input
                        type="date"
                        value={checkin}
                        min={todayISO()}
                        onChange={(e) => setCheckin(e.target.value)}
                        className="input px-3"
                        required
                      />
                    </div>
                    <div>
                      <p className="label">Check-out</p>
                      <input
                        type="date"
                        value={checkout}
                        min={checkin}
                        onChange={(e) => setCheckout(e.target.value)}
                        className="input px-3"
                        required
                      />
                    </div>
                  </div>

                  <div className="mt-3">
                    <p className="label">Guests</p>
                    <input
                      type="number"
                      min={1}
                      max={stay.guests}
                      value={guests}
                      onChange={(e) => setGuests(Number(e.target.value))}
                      className="input"
                      required
                    />
                  </div>

                  <div className="mt-3">
                    <p className="label">Mobile money</p>
                    <div className="grid grid-cols-3 gap-1.5">
                      {METHODS.map((option) => (
                        <button
                          type="button"
                          key={option.name}
                          onClick={() => setMethod(option.name)}
                          className={`rounded-xl border px-2 py-2.5 text-center transition ${
                            method === option.name
                              ? "border-forest bg-forest/5"
                              : "border-ink/12 hover:border-forest/40"
                          }`}
                        >
                          <Smartphone size={16} className="mx-auto text-forest" />
                          <span className="mt-1 block text-[10px] font-semibold leading-tight">{option.name}</span>
                          <span className="block text-[9px] text-ink/40">{option.note}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mt-3">
                    <p className="label">Phone number</p>
                    <div className="relative">
                      <Phone size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/35" />
                      <input
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+267 7X XXX XXX"
                        className="input pl-9"
                        required
                      />
                    </div>
                  </div>

                  <div className="mt-4 space-y-2 border-t border-ink/8 pt-4 text-sm">
                    <div className="flex justify-between text-ink/60">
                      <span>{money(stay.price)} × {nights || 0} night{nights === 1 ? "" : "s"}</span>
                      <span className="font-medium text-ink">{money(total)}</span>
                    </div>
                    <div className="flex justify-between font-semibold">
                      <span>Total</span>
                      <span className="text-forest">{money(total)}</span>
                    </div>
                  </div>

                  <button className="btn btn-primary mt-4 w-full" disabled={booking.isPending || nights < 1}>
                    <Wallet size={16} />
                    {booking.isPending ? "Processing…" : user ? `Book for ${money(total)}` : "Log in to book"}
                  </button>
                  {!user && (
                    <p className="mt-2 text-center text-xs text-ink/45">
                      <Link to="/login" className="font-semibold text-forest hover:underline">Log in</Link> to complete your booking.
                    </p>
                  )}
                  <p className="mt-3 text-center text-[11px] leading-relaxed text-ink/40">
                    Demo booking. No payment will be taken. You'll receive a reference number instantly.
                  </p>
                </form>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
