import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Home, Search, SlidersHorizontal, X } from "lucide-react";
import { PropertyCard } from "../components/PropertyCard";
import { EmptyState } from "../components/EmptyState";
import { SectionSkeleton } from "../components/Skeletons";
import { CATEGORIES, CategoryMark, categoryDef } from "../lib/categories";
import { api, qs } from "../lib/api";
import type { PropertyList } from "../lib/types";

const CITIES = ["Gaborone", "Francistown", "Maun", "Kasane", "Molepolole"];
const TYPES = ["House", "Apartment", "Flat", "Townhouse", "Cottage", "Studio"];
const PAGE_SIZE = 9;

export default function HousesPage() {
  const [params, setParams] = useSearchParams();
  const [search, setSearch] = useState(params.get("q") ?? "");
  const [showFilters, setShowFilters] = useState(false);

  const page = Math.max(1, Number(params.get("page") ?? 1));
  const sort = params.get("sort") ?? "newest";

  const filters = useMemo(
    () => ({
      q: params.get("q") ?? "",
      city: params.get("city") ?? "",
      property_type: params.get("property_type") ?? "",
      category: params.get("category") ?? "",
      min_price: params.get("min_price") ?? "",
      max_price: params.get("max_price") ?? "",
      bedrooms: params.get("bedrooms") ?? "",
      bathrooms: params.get("bathrooms") ?? "",
      furnished: params.get("furnished") ?? "",
      sort,
      page,
      page_size: PAGE_SIZE,
    }),
    [params, sort, page],
  );

  useEffect(() => {
    setSearch(params.get("q") ?? "");
  }, [params]);

  const query = useQuery({
    queryKey: ["properties", filters],
    queryFn: () => api<PropertyList>(`/properties${qs(filters)}`),
  });

  function update(key: string, value: string) {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== "page") next.delete("page");
    setParams(next, { replace: true });
  }

  function submitSearch(event: FormEvent) {
    event.preventDefault();
    update("q", search.trim());
  }

  function clearAll() {
    setParams(new URLSearchParams(), { replace: true });
    setSearch("");
  }

  const activeFilters = [
    params.get("q") && { key: "q", label: `“${params.get("q")}”` },
    params.get("city") && { key: "city", label: params.get("city")! },
    params.get("property_type") && { key: "property_type", label: params.get("property_type")! },
    params.get("category") && {
      key: "category",
      label: `${categoryDef(params.get("category")!)?.label ?? params.get("category")} only`,
    },
    params.get("min_price") && { key: "min_price", label: `from P${Number(params.get("min_price")).toLocaleString()}` },
    params.get("max_price") && { key: "max_price", label: `up to P${Number(params.get("max_price")).toLocaleString()}` },
    params.get("bedrooms") && { key: "bedrooms", label: `${params.get("bedrooms")}+ bed` },
    params.get("bathrooms") && { key: "bathrooms", label: `${params.get("bathrooms")}+ bath` },
    params.get("furnished") === "true" && { key: "furnished", label: "Furnished" },
  ].filter(Boolean) as { key: string; label: string }[];

  const total = query.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const activeCategory = categoryDef(params.get("category") ?? "");

  return (
    <div className="container-page pb-10">
      <div className="pb-8 pt-12">
        <p className="eyebrow">{activeCategory ? `Browse ${activeCategory.label.toLowerCase()}` : "Rental homes"}</p>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
          <h1 className="text-balance text-4xl font-semibold leading-[1.05] sm:text-5xl">
            {activeCategory ? `${activeCategory.label} homes.` : "Find your next home."}
          </h1>
          <p className="max-w-sm text-sm text-ink/55">
            {query.isLoading
              ? "Searching across Botswana…"
              : activeCategory
                ? `${activeCategory.blurb} ${total} home${total === 1 ? "" : "s"} available.`
                : `${total} home${total === 1 ? "" : "s"} match your search.`}
          </p>
        </div>

        <form onSubmit={submitSearch} className="mt-7 flex flex-col gap-2 sm:flex-row">
          <div className="relative flex-1">
            <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink/35" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-11"
              placeholder="Search by area, home name or feature…"
              aria-label="Search homes"
            />
          </div>
          <button type="submit" className="btn btn-primary">Search homes</button>
          <button
            type="button"
            onClick={() => setShowFilters((open) => !open)}
            className="btn btn-ghost lg:hidden"
          >
            <SlidersHorizontal size={16} /> Filters
          </button>
        </form>

        <div className="no-scrollbar mt-5 flex items-center gap-1 overflow-x-auto pb-1 sm:gap-2">
          <button
            type="button"
            onClick={() => update("category", "")}
            className={`shrink-0 rounded-full border px-2.5 py-1.5 text-[11px] font-semibold transition sm:px-4 sm:py-2 sm:text-xs ${
              !params.get("category")
                ? "border-forest bg-forest text-cream"
                : "border-ink/12 bg-white text-ink/65 hover:border-forest/40 hover:text-forest"
            }`}
          >
            <span className="sm:hidden">All</span>
            <span className="hidden sm:inline">All homes</span>
          </button>
          {CATEGORIES.map((category) => {
            const active = params.get("category") === category.value;
            return (
              <button
                key={category.value}
                type="button"
                onClick={() => update("category", active ? "" : category.value)}
                className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-1.5 text-[11px] font-semibold transition sm:gap-2 sm:px-4 sm:py-2 sm:text-xs ${
                  active
                    ? "border-forest bg-forest text-cream"
                    : "border-ink/12 bg-white text-ink/65 hover:border-forest/40 hover:text-forest"
                }`}
              >
                <CategoryMark category={category} size={13} />
                {category.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[270px_1fr]">
        <aside className={`${showFilters ? "block" : "hidden"} lg:block`}>
          <div className="sticky top-32 space-y-6 rounded-3xl border border-ink/10 bg-white p-5">
            <div className="flex items-center justify-between">
              <p className="font-display text-lg font-semibold">Filters</p>
              <button onClick={clearAll} className="text-xs font-semibold text-clay hover:underline">
                Reset
              </button>
            </div>

            <div>
              <p className="label">City</p>
              <div className="flex flex-wrap gap-2">
                {CITIES.map((city) => (
                  <button
                    key={city}
                    onClick={() => update("city", params.get("city") === city ? "" : city)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                      params.get("city") === city
                        ? "border-forest bg-forest text-cream"
                        : "border-ink/12 bg-cream/60 text-ink/65 hover:border-forest/40"
                    }`}
                  >
                    {city}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="label">Home type</p>
              <select
                value={params.get("property_type") ?? ""}
                onChange={(e) => update("property_type", e.target.value)}
                className="input"
              >
                <option value="">Any type</option>
                {TYPES.map((type) => (
                  <option key={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <p className="label">Monthly rent</p>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  min={0}
                  placeholder="Min"
                  value={params.get("min_price") ?? ""}
                  onChange={(e) => update("min_price", e.target.value)}
                  className="input px-3"
                />
                <input
                  type="number"
                  min={0}
                  placeholder="Max"
                  value={params.get("max_price") ?? ""}
                  onChange={(e) => update("max_price", e.target.value)}
                  className="input px-3"
                />
              </div>
            </div>

            <div>
              <p className="label">Bedrooms</p>
              <div className="flex gap-2">
                {["", "1", "2", "3", "4"].map((n) => (
                  <button
                    key={n || "any"}
                    onClick={() => update("bedrooms", n)}
                    className={`h-9 flex-1 rounded-lg border text-xs font-semibold transition ${
                      (params.get("bedrooms") ?? "") === n
                        ? "border-forest bg-forest text-cream"
                        : "border-ink/12 text-ink/60 hover:border-forest/40"
                    }`}
                  >
                    {n ? `${n}+` : "Any"}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="label">Bathrooms</p>
              <div className="flex gap-2">
                {["", "1", "2", "3"].map((n) => (
                  <button
                    key={n || "any"}
                    onClick={() => update("bathrooms", n)}
                    className={`h-9 flex-1 rounded-lg border text-xs font-semibold transition ${
                      (params.get("bathrooms") ?? "") === n
                        ? "border-forest bg-forest text-cream"
                        : "border-ink/12 text-ink/60 hover:border-forest/40"
                    }`}
                  >
                    {n ? `${n}+` : "Any"}
                  </button>
                ))}
              </div>
            </div>

            <label className="flex cursor-pointer items-center justify-between rounded-xl bg-cream px-4 py-3">
              <span className="text-sm font-medium">Furnished only</span>
              <input
                type="checkbox"
                checked={params.get("furnished") === "true"}
                onChange={(e) => update("furnished", e.target.checked ? "true" : "")}
                className="h-4 w-4 accent-forest"
              />
            </label>
          </div>
        </aside>

        <div className="min-w-0">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              {activeFilters.map((filter) => (
                <button
                  key={filter.key}
                  onClick={() => update(filter.key, "")}
                  className="inline-flex items-center gap-1.5 rounded-full bg-forest/8 px-3 py-1.5 text-xs font-medium text-forest transition hover:bg-forest/15"
                >
                  {filter.label}
                  <X size={12} />
                </button>
              ))}
              {activeFilters.length > 0 && (
                <button onClick={clearAll} className="text-xs text-ink/40 hover:text-clay">Clear all</button>
              )}
            </div>
            <label className="flex items-center gap-2 text-xs text-ink/50">
              Sort by
              <select
                value={sort}
                onChange={(e) => update("sort", e.target.value)}
                className="rounded-lg border border-ink/15 bg-white px-3 py-2 text-xs font-medium text-ink outline-none focus:border-forest"
              >
                <option value="newest">Newest first</option>
                <option value="price_asc">Price: low to high</option>
                <option value="price_desc">Price: high to low</option>
                <option value="bedrooms">Most bedrooms</option>
              </select>
            </label>
          </div>

          {query.isLoading ? (
            <SectionSkeleton count={6} />
          ) : query.isError ? (
            <EmptyState
              icon={<Home size={24} />}
              title="We couldn't load homes"
              description="Please check your connection and try again."
              action={<button onClick={() => query.refetch()} className="btn btn-primary">Try again</button>}
            />
          ) : query.data && query.data.items.length === 0 ? (
            <EmptyState
              icon={<Search size={24} />}
              title="No homes match yet"
              description="Try widening your budget or removing a filter. New listings are added often."
              action={<button onClick={clearAll} className="btn btn-primary">Clear filters</button>}
            />
          ) : (
            <>
              <div className="grid gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
                {query.data?.items.map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="mt-12 flex items-center justify-center gap-2">
                  <button
                    onClick={() => update("page", String(page - 1))}
                    disabled={page <= 1}
                    className="grid h-10 w-10 place-items-center rounded-full border border-ink/12 bg-white text-ink/60 transition enabled:hover:border-forest enabled:hover:text-forest disabled:opacity-35"
                    aria-label="Previous page"
                  >
                    <ChevronLeft size={17} />
                  </button>
                  {Array.from({ length: totalPages }).map((_, i) => {
                    const n = i + 1;
                    if (totalPages > 7 && Math.abs(n - page) > 2 && n !== 1 && n !== totalPages) {
                      if (n === 2 || n === totalPages - 1) return <span key={n} className="px-1 text-ink/30">…</span>;
                      return null;
                    }
                    return (
                      <button
                        key={n}
                        onClick={() => update("page", String(n))}
                        className={`h-10 w-10 rounded-full text-sm font-semibold transition ${
                          n === page ? "bg-forest text-cream" : "border border-ink/12 bg-white text-ink/60 hover:border-forest"
                        }`}
                      >
                        {n}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => update("page", String(page + 1))}
                    disabled={page >= totalPages}
                    className="grid h-10 w-10 place-items-center rounded-full border border-ink/12 bg-white text-ink/60 transition enabled:hover:border-forest enabled:hover:text-forest disabled:opacity-35"
                    aria-label="Next page"
                  >
                    <ChevronRight size={17} />
                  </button>
                </div>
              )}

              <div className="mt-12 rounded-3xl border border-ink/10 bg-white p-6 text-center sm:p-8">
                <p className="text-sm text-ink/55">
                  Looking for a short stay instead?{" "}
                  <Link to="/stays" className="link-underline text-sm">Browse stays and guesthouses</Link>
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
