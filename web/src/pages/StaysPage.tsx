import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { StayCard } from "../components/StayCard";
import { EmptyState } from "../components/EmptyState";
import { api } from "../lib/api";
import type { Stay } from "../lib/types";

const TYPES = ["Guesthouse", "Lodge", "Airbnb", "Hotel"];

export default function StaysPage() {
  const [params, setParams] = useSearchParams();
  const [search, setSearch] = useState("");
  const type = params.get("type") ?? "";

  const query = useQuery({
    queryKey: ["stays", type],
    queryFn: () => api<Stay[]>(`/stays${type ? `?stay_type=${type}` : ""}`),
  });

  const results = (query.data ?? []).filter((stay) => {
    if (!search.trim()) return true;
    const needle = search.toLowerCase();
    return (
      stay.title.toLowerCase().includes(needle) ||
      stay.location.toLowerCase().includes(needle) ||
      stay.city.toLowerCase().includes(needle)
    );
  });

  return (
    <div className="container-page pb-10">
      <div className="pb-8 pt-12">
        <p className="eyebrow">Short stays</p>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
          <h1 className="max-w-2xl text-balance text-4xl font-semibold leading-[1.05] sm:text-5xl">
            A bed for a night, a base for a season.
          </h1>
          <p className="max-w-sm text-sm text-ink/55">
            Guesthouses, lodges and self-catering stays across Botswana — book directly and pay with your
            preferred mobile money.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-3xl border border-ink/10 bg-white p-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink/35" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search stays by name or place…"
            className="input border-0 bg-cream pl-11 focus:ring-0"
          />
        </div>
        <div className="flex flex-wrap gap-1.5 p-1">
          <button
            onClick={() => setParams({})}
            className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
              !type ? "bg-forest text-cream" : "text-ink/55 hover:bg-forest/5"
            }`}
          >
            All stays
          </button>
          {TYPES.map((option) => (
            <button
              key={option}
              onClick={() => setParams({ type: option })}
              className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                type === option ? "bg-forest text-cream" : "text-ink/55 hover:bg-forest/5"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
        {query.isLoading &&
          Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton aspect-[4/3] rounded-3xl" />)}
        {results.map((stay) => (
          <StayCard key={stay.id} stay={stay} />
        ))}
      </div>

      {!query.isLoading && results.length === 0 && (
        <EmptyState
          icon={<Search size={24} />}
          title="No stays match that search"
          description="Try another town or clear the filters to see everything available."
          action={
            <button
              onClick={() => {
                setSearch("");
                setParams({});
              }}
              className="btn btn-primary"
            >
              Show all stays
            </button>
          }
        />
      )}
    </div>
  );
}
