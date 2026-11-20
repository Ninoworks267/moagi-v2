import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Search, SlidersHorizontal } from "lucide-react";

const CITIES = ["Anywhere", "Gaborone", "Francistown", "Maun", "Kasane", "Molepolole"];
const TYPES = ["Any type", "House", "Apartment", "Flat", "Townhouse", "Cottage", "Studio"];
const BUDGETS = [
  { label: "Any budget", value: "" },
  { label: "Up to P3,000", value: "3000" },
  { label: "Up to P5,000", value: "5000" },
  { label: "Up to P8,000", value: "8000" },
  { label: "Up to P12,000", value: "12000" },
];

export function SearchPanel({ compact = false }: { compact?: boolean }) {
  const navigate = useNavigate();
  const [city, setCity] = useState("Anywhere");
  const [type, setType] = useState("Any type");
  const [budget, setBudget] = useState("");

  function submit(event: FormEvent) {
    event.preventDefault();
    const params = new URLSearchParams();
    if (city !== "Anywhere") params.set("city", city);
    if (type !== "Any type") params.set("property_type", type);
    if (budget) params.set("max_price", budget);
    navigate(`/houses${params.toString() ? `?${params.toString()}` : ""}`);
  }

  return (
    <form
      onSubmit={submit}
      className={`rounded-[26px] border border-ink/10 bg-white/95 p-2.5 shadow-[0_24px_60px_-24px_rgba(13,26,19,0.35)] backdrop-blur ${
        compact ? "" : "sm:p-3"
      }`}
    >
      <div className="grid gap-2 sm:grid-cols-[1.2fr_1fr_1fr_auto]">
        <label className="flex items-center gap-2.5 rounded-2xl bg-cream px-4 py-3">
          <MapPin size={18} className="shrink-0 text-forest" />
          <span className="min-w-0 flex-1">
            <span className="block text-[10px] font-semibold uppercase tracking-[0.16em] text-ink/45">Where</span>
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full bg-transparent text-sm font-medium text-ink outline-none"
            >
              {CITIES.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          </span>
        </label>

        <label className="flex items-center gap-2.5 rounded-2xl bg-cream px-4 py-3">
          <SlidersHorizontal size={18} className="shrink-0 text-forest" />
          <span className="min-w-0 flex-1">
            <span className="block text-[10px] font-semibold uppercase tracking-[0.16em] text-ink/45">Home type</span>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full bg-transparent text-sm font-medium text-ink outline-none"
            >
              {TYPES.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          </span>
        </label>

        <label className="flex items-center gap-2.5 rounded-2xl bg-cream px-4 py-3">
          <span className="grid h-[18px] w-[18px] place-items-center text-sm font-bold text-forest">P</span>
          <span className="min-w-0 flex-1">
            <span className="block text-[10px] font-semibold uppercase tracking-[0.16em] text-ink/45">Monthly budget</span>
            <select
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              className="w-full bg-transparent text-sm font-medium text-ink outline-none"
            >
              {BUDGETS.map((option) => (
                <option key={option.label} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </span>
        </label>

        <button type="submit" className="btn btn-primary rounded-2xl sm:px-7">
          <Search size={17} />
          Search
        </button>
      </div>
    </form>
  );
}
