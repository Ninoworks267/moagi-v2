import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  Home,
  KeyRound,
  MapPin,
  MessageSquare,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { SearchPanel } from "../components/SearchPanel";
import { PropertyCard } from "../components/PropertyCard";
import { StayCard } from "../components/StayCard";
import { SectionHeading } from "../components/UI";
import { SectionSkeleton } from "../components/Skeletons";
import { CATEGORIES, CategoryMark } from "../lib/categories";
import { api } from "../lib/api";
import type { PropertyList, Stay } from "../lib/types";

const CITIES = [
  {
    name: "Gaborone",
    tagline: "The capital, close to everything",
    image: "https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Francistown",
    tagline: "Space to grow in the north",
    image: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Maun",
    tagline: "Gateway to the Okavango",
    image: "https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Kasane",
    tagline: "Riverside living and Chobe",
    image: "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=900&q=80",
  },
];

export default function HomePage() {
  const homes = useQuery({
    queryKey: ["properties", "home"],
    queryFn: () => api<PropertyList>("/properties?page_size=6"),
  });
  const stays = useQuery({
    queryKey: ["stays", "home"],
    queryFn: () => api<Stay[]>("/stays"),
  });

  const featured = homes.data?.items ?? [];
  const totalHomes = homes.data?.total;

  return (
    <div className="overflow-hidden">
      <section className="container-page pt-5 sm:pt-8">
        <div className="relative flex min-h-[640px] items-end overflow-hidden rounded-[32px] sm:rounded-[44px]">
          <img
            src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=2000&q=85"
            alt="A warm modern home at dusk"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-ink/95 via-ink/60 to-ink/10" />
          <div className="grain absolute inset-0 opacity-[0.13]" />

          <div className="relative z-10 w-full px-5 pb-8 pt-24 sm:px-10 sm:pb-12 lg:px-14">
            <div className="animate-fade-up max-w-3xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-cream/20 bg-white/10 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-cream backdrop-blur">
                <Sparkles size={13} className="text-gold" />
                Botswana's home-finding space
              </span>
              <h1 className="mt-6 text-balance text-[42px] font-semibold leading-[0.98] text-cream sm:text-6xl lg:text-[76px]">
                Find your space.
                <br />
                Feel <span className="text-gold">at home.</span>
              </h1>
              <p className="mt-5 max-w-xl text-balance text-base leading-relaxed text-cream/70 sm:text-lg">
                Real homes, honest landlords and short stays across Botswana. Search with confidence,
                message directly, and move into a place that fits your life.
              </p>
            </div>

            <div className="animate-fade-up mt-9 max-w-5xl" style={{ animationDelay: "120ms" }}>
              <SearchPanel />
            </div>

            <div
              className="animate-fade-up mt-7 flex flex-wrap items-center gap-x-7 gap-y-2 text-xs font-medium text-cream/60"
              style={{ animationDelay: "220ms" }}
            >
              <span className="inline-flex items-center gap-1.5"><ShieldCheck size={15} className="text-gold" /> Verified landlords</span>
              <span className="inline-flex items-center gap-1.5"><MessageSquare size={15} className="text-gold" /> Direct messaging</span>
              <span className="inline-flex items-center gap-1.5"><BadgeCheck size={15} className="text-gold" /> Honest reviews</span>
            </div>
          </div>
        </div>
      </section>

      <section className="container-page">
        <div className="mt-12 grid grid-cols-2 gap-6 rounded-3xl border border-ink/8 bg-white/60 px-6 py-7 sm:grid-cols-4 sm:px-10">
          {[
            { value: totalHomes ? `${totalHomes}+` : "—", label: "Homes to explore" },
            { value: "5", label: "Cities across Botswana" },
            { value: "8+", label: "Stays & guesthouses" },
            { value: "100%", label: "Free to browse" },
          ].map((stat) => (
            <div key={stat.label}>
              <p className="font-display text-3xl font-semibold text-forest sm:text-4xl">{stat.value}</p>
              <p className="mt-1 text-xs text-ink/50">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container-page pt-16 sm:pt-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Browse by need</p>
            <h2 className="mt-2 text-balance text-3xl font-semibold sm:text-4xl">A home that fits your chapter.</h2>
          </div>
          <Link to="/houses" className="link-underline text-sm">
            See every listing <ArrowRight size={15} />
          </Link>
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {CATEGORIES.map((category) => (
            <Link
              key={category.value}
              to={`/houses?category=${category.value}`}
              className="group rounded-3xl border border-ink/10 bg-white p-5 transition duration-300 hover:-translate-y-1 hover:border-forest/25 hover:shadow-lg hover:shadow-ink/5"
            >
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-forest/8 text-forest transition group-hover:bg-forest group-hover:text-cream">
                <CategoryMark category={category} size={20} />
              </span>
              <p className="mt-5 font-display text-xl font-semibold">{category.label}</p>
              <p className="mt-1 text-xs leading-relaxed text-ink/50">{category.blurb}</p>
              <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-forest">
                Explore <ArrowRight size={13} className="transition group-hover:translate-x-0.5" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="container-page pt-20 sm:pt-28">
        <SectionHeading
          eyebrow="Handpicked for you"
          title="Homes worth a closer look"
          subtitle="Fresh listings from landlords who care about the details."
          action={
            <Link to="/houses" className="link-underline text-sm">
              Browse all homes <ArrowRight size={15} />
            </Link>
          }
        />
        {homes.isLoading ? (
          <SectionSkeleton count={6} />
        ) : (
          <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((property, index) => (
              <div
                key={property.id}
                className="animate-fade-up"
                style={{ animationDelay: `${Math.min(index * 60, 300)}ms` }}
              >
                <PropertyCard property={property} />
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="container-page pt-24">
        <SectionHeading
          eyebrow="Where to next?"
          title="Start with a city"
          subtitle="From the capital to the Chobe riverfront, find your corner of Botswana."
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CITIES.map((city, index) => (
            <Link
              key={city.name}
              to={`/houses?city=${city.name}`}
              className="group relative flex aspect-[4/5] items-end overflow-hidden rounded-3xl"
            >
              <img
                src={city.image}
                alt={city.name}
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/20 to-transparent" />
              <div className="relative z-10 flex w-full items-end justify-between gap-2 p-5">
                <div>
                  <p className="font-display text-2xl font-semibold text-cream">{city.name}</p>
                  <p className="mt-1 text-xs text-cream/65">{city.tagline}</p>
                </div>
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-cream/15 text-cream backdrop-blur transition group-hover:bg-gold group-hover:text-ink">
                  <ArrowRight size={16} />
                </span>
              </div>
              <span
                className="absolute right-4 top-4 rounded-full bg-cream/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-forest opacity-0 transition group-hover:opacity-100"
                style={{ transitionDelay: `${index * 20}ms` }}
              >
                Explore
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section id="how-it-works" className="container-page scroll-mt-24 pt-24">
        <div className="rounded-[36px] bg-sand px-6 py-12 sm:px-12 sm:py-16">
          <SectionHeading
            eyebrow="Simple by design"
            title="Three steps to your next home"
            subtitle="No agents chasing you. No hidden process. Just people connecting directly."
          />
          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                icon: <Home size={22} />,
                number: "01",
                title: "Find a place",
                text: "Filter by city, budget, bedrooms and the details that matter to you. Compare real photos and honest descriptions.",
              },
              {
                icon: <MessageSquare size={22} />,
                number: "02",
                title: "Talk to the landlord",
                text: "Message directly from the listing. Ask about water, parking, deposits and viewings without leaving MOAGI.",
              },
              {
                icon: <KeyRound size={22} />,
                number: "03",
                title: "Move in",
                text: "Agree the terms, sign your lease and settle in. Leave a review later to help the next tenant.",
              },
            ].map((step) => (
              <div key={step.number} className="border-t border-ink/15 pt-6">
                <div className="flex items-center justify-between">
                  <span className="grid h-12 w-12 place-items-center rounded-2xl bg-cream text-forest">{step.icon}</span>
                  <span className="font-display text-4xl font-semibold text-ink/15">{step.number}</span>
                </div>
                <h3 className="mt-5 text-xl font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink/55">{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-page pt-24">
        <SectionHeading
          eyebrow="Short stays"
          title="A place for a night or a season"
          subtitle="Guesthouses, lodges and self-catering stays for work trips, weekends and everything between."
          action={
            <Link to="/stays" className="link-underline text-sm">
              Explore stays <ArrowRight size={15} />
            </Link>
          }
        />
        <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {(stays.data ?? []).slice(0, 3).map((stay) => (
            <StayCard key={stay.id} stay={stay} />
          ))}
          {stays.isLoading && Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton aspect-[4/3] rounded-3xl" />)}
        </div>
      </section>

      <section className="container-page pt-24">
        <div className="relative overflow-hidden rounded-[36px] bg-forest">
          <div className="grid items-stretch lg:grid-cols-2">
            <div className="relative z-10 p-8 sm:p-12 lg:p-16">
              <p className="eyebrow text-gold">For landlords</p>
              <h2 className="mt-4 text-balance text-4xl font-semibold text-cream sm:text-5xl">
                Your home deserves the right tenant.
              </h2>
              <p className="mt-5 max-w-md text-sm leading-relaxed text-cream/70">
                List your property in minutes, reach serious tenants and manage enquiries in one simple
                dashboard. No listing fees while MOAGI grows.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link to="/properties/new" className="btn btn-clay">
                  List a home <ArrowRight size={16} />
                </Link>
                <Link to="/dashboard" className="btn btn-light">
                  Landlord dashboard
                </Link>
              </div>
              <div className="mt-10 grid grid-cols-3 gap-4 border-t border-cream/15 pt-6 text-cream/70">
                <div>
                  <p className="font-display text-2xl font-semibold text-cream">Free</p>
                  <p className="mt-1 text-xs">to list</p>
                </div>
                <div>
                  <p className="font-display text-2xl font-semibold text-cream">Direct</p>
                  <p className="mt-1 text-xs">tenant chats</p>
                </div>
                <div>
                  <p className="font-display text-2xl font-semibold text-cream">Local</p>
                  <p className="mt-1 text-xs">Botswana made</p>
                </div>
              </div>
            </div>
            <div className="relative min-h-[280px] lg:min-h-[460px]">
              <img
                src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80"
                alt="A bright, well-finished interior"
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-forest via-forest/30 to-transparent lg:bg-gradient-to-r" />
            </div>
          </div>
        </div>
      </section>

      <section className="container-page pt-24">
        <div className="flex flex-col items-center rounded-[36px] border border-ink/10 bg-white px-6 py-16 text-center">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-mist text-forest">
            <Building2 size={24} />
          </div>
          <h2 className="mt-6 text-balance text-3xl font-semibold sm:text-4xl">Ready when you are.</h2>
          <p className="mt-3 max-w-md text-sm text-ink/55">
            Join tenants and landlords already using MOAGI to make moving in Botswana simpler.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link to="/houses" className="btn btn-primary">
              Find a home <ArrowRight size={16} />
            </Link>
            <Link to="/register" className="btn btn-ghost">
              Create an account
            </Link>
          </div>
          <p className="mt-8 flex items-center gap-1.5 text-xs text-ink/40">
            <MapPin size={13} /> Gaborone · Francistown · Maun · Kasane
          </p>
        </div>
      </section>
    </div>
  );
}
