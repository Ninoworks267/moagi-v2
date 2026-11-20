import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Check,
  ImagePlus,
  Loader2,
  MapPin,
  Plus,
  Sparkles,
  Trash2,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import { PageLoader } from "../components/Skeletons";
import { EmptyState } from "../components/EmptyState";
import { api } from "../lib/api";
import { money } from "../lib/format";
import { useAuth } from "../context/AuthContext";
import type { Property, PropertyInput } from "../lib/types";

const TYPES = ["House", "Apartment", "Flat", "Townhouse", "Cottage", "Studio"];
const CITIES = ["Gaborone", "Francistown", "Maun", "Kasane", "Molepolole", "Other"];
const CATEGORY_OPTIONS = [
  { value: "all", label: "Everyone" },
  { value: "promo", label: "Promo" },
  { value: "students", label: "Students" },
  { value: "women", label: "Women" },
  { value: "men", label: "Men" },
];
const AMENITIES = [
  "Fibre internet",
  "Secure parking",
  "24h security",
  "Pre-paid electricity",
  "Borehole backup",
  "Walled garden",
  "Pet friendly",
  "Fully furnished",
  "Swimming pool",
  "Gym",
  "Laundry room",
  "Water tank",
  "Solar",
  "Air conditioning",
  "Garden",
  "Balcony",
  "Carport",
  "En-suite bedrooms",
  "Scullery",
  "Lift access",
];

const EMPTY: PropertyInput = {
  title: "",
  location: "",
  city: "Gaborone",
  price: 0,
  bedrooms: 1,
  bathrooms: 1,
  property_type: "House",
  category: "all",
  description: "",
  photos: [],
  amenities: [],
  furnished: false,
  parking: false,
  water_included: false,
  electricity_included: false,
  deposit: 0,
  available_from: "Immediately",
  featured: false,
};

export default function PropertyFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [form, setForm] = useState<PropertyInput>(EMPTY);
  const [photoUrl, setPhotoUrl] = useState("");
  const [customAmenity, setCustomAmenity] = useState("");
  const [uploading, setUploading] = useState(false);
  const [loaded, setLoaded] = useState(!isEdit);

  const propertyQuery = useQuery({
    queryKey: ["property", Number(id)],
    queryFn: () => api<Property>(`/properties/${id}`),
    enabled: isEdit,
  });

  useEffect(() => {
    if (propertyQuery.data && !loaded) {
      const p = propertyQuery.data;
      setForm({
        title: p.title,
        location: p.location,
        city: p.city,
        price: p.price,
        bedrooms: p.bedrooms,
        bathrooms: p.bathrooms,
        property_type: p.property_type,
        category: p.category,
        description: p.description,
        photos: p.photos,
        amenities: p.amenities,
        furnished: p.furnished,
        parking: p.parking,
        water_included: p.water_included,
        electricity_included: p.electricity_included,
        deposit: p.deposit,
        available_from: p.available_from ?? "",
        featured: p.featured,
      });
      setLoaded(true);
    }
  }, [propertyQuery.data, loaded]);

  function set<K extends keyof PropertyInput>(key: K, value: PropertyInput[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function toggleAmenity(amenity: string) {
    set(
      "amenities",
      form.amenities.includes(amenity)
        ? form.amenities.filter((item) => item !== amenity)
        : [...form.amenities, amenity],
    );
  }

  function addPhotoUrl() {
    const value = photoUrl.trim();
    if (!value) return;
    set("photos", [...form.photos, value]);
    setPhotoUrl("");
  }

  function removePhoto(index: number) {
    set("photos", form.photos.filter((_, i) => i !== index));
  }

  function makeCover(index: number) {
    const photos = [...form.photos];
    const [chosen] = photos.splice(index, 1);
    set("photos", [chosen, ...photos]);
  }

  async function handleUpload(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    if (!files.length) return;
    setUploading(true);
    try {
      const uploaded: string[] = [];
      for (const file of files) {
        const data = new FormData();
        data.append("file", file);
        const result = await api<{ url: string }>("/uploads", { method: "POST", body: data });
        uploaded.push(result.url);
      }
      set("photos", [...form.photos, ...uploaded]);
      toast.success(`${uploaded.length} photo${uploaded.length === 1 ? "" : "s"} uploaded.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed.");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }

  const save = useMutation({
    mutationFn: () => {
      const payload = { ...form, price: Number(form.price), deposit: Number(form.deposit) };
      return isEdit
        ? api<Property>(`/properties/${id}`, { method: "PATCH", body: payload })
        : api<Property>("/properties", { method: "POST", body: payload });
    },
    onSuccess: (property) => {
      toast.success(isEdit ? "Listing updated." : "Your home is live on MOAGI.");
      queryClient.invalidateQueries({ queryKey: ["properties"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["property", property.id] });
      navigate(`/properties/${property.id}`);
    },
    onError: (error: Error) => toast.error(error.message),
  });

  function submit(event: FormEvent) {
    event.preventDefault();
    if (form.photos.length === 0) {
      toast.error("Add at least one photo so tenants can see the home.");
      return;
    }
    save.mutate();
  }

  if (isEdit && propertyQuery.isLoading) return <PageLoader />;
  if (isEdit && (propertyQuery.isError || !propertyQuery.data)) {
    return (
      <div className="container-page py-20">
        <EmptyState
          icon={<MapPin size={24} />}
          title="Listing not found"
          description="It may have been removed."
          action={<Link to="/dashboard" className="btn btn-primary">Back to dashboard</Link>}
        />
      </div>
    );
  }

  return (
    <div className="container-page pb-14">
      <div className="flex flex-wrap items-end justify-between gap-4 pb-8 pt-10">
        <div>
          <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-ink/50 hover:text-forest">
            <ArrowLeft size={15} /> Dashboard
          </Link>
          <h1 className="mt-3 text-4xl font-semibold">{isEdit ? "Edit your listing" : "List your home"}</h1>
          <p className="mt-2 max-w-xl text-sm text-ink/55">
            Great photos and honest details get the best tenants. You can update everything later.
          </p>
        </div>
        <div className="flex gap-2">
          <Link to={isEdit ? `/properties/${id}` : "/dashboard"} className="btn btn-ghost">Cancel</Link>
          <button onClick={submit} className="btn btn-primary" disabled={save.isPending}>
            {save.isPending ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
            {isEdit ? "Save changes" : "Publish listing"}
          </button>
        </div>
      </div>

      <form onSubmit={submit} className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <section className="card p-6">
            <div className="flex items-center gap-3">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-forest text-xs font-bold text-cream">1</span>
              <h2 className="text-xl font-semibold">The basics</h2>
            </div>
            <div className="mt-5 space-y-4">
              <div>
                <label className="label" htmlFor="title">Listing title</label>
                <input
                  id="title"
                  className="input"
                  value={form.title}
                  onChange={(e) => set("title", e.target.value)}
                  placeholder="e.g. Bright 2-bedroom apartment in Block 8"
                  minLength={4}
                  required
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="label" htmlFor="location">Area / address</label>
                  <input
                    id="location"
                    className="input"
                    value={form.location}
                    onChange={(e) => set("location", e.target.value)}
                    placeholder="Block 8, Gaborone"
                    required
                  />
                </div>
                <div>
                  <label className="label" htmlFor="city">City</label>
                  <select id="city" className="input" value={form.city} onChange={(e) => set("city", e.target.value)}>
                    {CITIES.map((city) => (
                      <option key={city}>{city}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <label className="label" htmlFor="price">Monthly rent (P)</label>
                  <input
                    id="price"
                    type="number"
                    min={1}
                    className="input"
                    value={form.price || ""}
                    onChange={(e) => set("price", Number(e.target.value))}
                    required
                  />
                </div>
                <div>
                  <label className="label" htmlFor="deposit">Deposit (P)</label>
                  <input
                    id="deposit"
                    type="number"
                    min={0}
                    className="input"
                    value={form.deposit || ""}
                    onChange={(e) => set("deposit", Number(e.target.value))}
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="label" htmlFor="available">Available from</label>
                  <input
                    id="available"
                    className="input"
                    value={form.available_from ?? ""}
                    onChange={(e) => set("available_from", e.target.value)}
                    placeholder="Immediately"
                  />
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-4">
                <div>
                  <label className="label" htmlFor="property_type">Home type</label>
                  <select id="property_type" className="input" value={form.property_type} onChange={(e) => set("property_type", e.target.value)}>
                    {TYPES.map((type) => (
                      <option key={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label" htmlFor="category">Who is it for?</label>
                  <select id="category" className="input" value={form.category} onChange={(e) => set("category", e.target.value)}>
                    {CATEGORY_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label" htmlFor="bedrooms">Bedrooms</label>
                  <input
                    id="bedrooms"
                    type="number"
                    min={0}
                    max={30}
                    className="input"
                    value={form.bedrooms}
                    onChange={(e) => set("bedrooms", Number(e.target.value))}
                    required
                  />
                </div>
                <div>
                  <label className="label" htmlFor="bathrooms">Bathrooms</label>
                  <input
                    id="bathrooms"
                    type="number"
                    min={0}
                    max={30}
                    className="input"
                    value={form.bathrooms}
                    onChange={(e) => set("bathrooms", Number(e.target.value))}
                    required
                  />
                </div>
              </div>
            </div>
          </section>

          <section className="card p-6">
            <div className="flex items-center gap-3">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-forest text-xs font-bold text-cream">2</span>
              <h2 className="text-xl font-semibold">Photos</h2>
            </div>
            <p className="mt-2 text-sm text-ink/50">Add up to 10 photos. The first photo is your cover image.</p>

            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {form.photos.map((photo, index) => (
                <div key={`${photo}-${index}`} className="group relative aspect-[4/3] overflow-hidden rounded-2xl bg-sand">
                  <img src={photo} alt={`Photo ${index + 1}`} className="h-full w-full object-cover" />
                  {index === 0 && (
                    <span className="absolute left-2 top-2 rounded-full bg-forest px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-cream">
                      Cover
                    </span>
                  )}
                  <div className="absolute inset-x-2 bottom-2 flex gap-1 opacity-0 transition group-hover:opacity-100">
                    {index !== 0 && (
                      <button
                        type="button"
                        onClick={() => makeCover(index)}
                        className="flex-1 rounded-lg bg-white/95 px-2 py-1 text-[10px] font-semibold text-ink backdrop-blur"
                      >
                        Make cover
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
                      className="grid h-7 w-7 place-items-center rounded-lg bg-white/95 text-clay backdrop-blur"
                      aria-label="Remove photo"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
              <label className="flex aspect-[4/3] cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-ink/15 bg-cream/50 text-center transition hover:border-forest/40 hover:bg-forest/5">
                {uploading ? <Loader2 size={22} className="animate-spin text-forest" /> : <ImagePlus size={22} className="text-forest" />}
                <span className="px-2 text-xs font-semibold">{uploading ? "Uploading…" : "Upload photos"}</span>
                <span className="px-2 text-[10px] text-ink/40">JPG, PNG or WEBP · max 5MB</span>
                <input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={handleUpload} className="hidden" disabled={uploading} />
              </label>
            </div>

            <div className="mt-4 flex gap-2">
              <input
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
                className="input"
                placeholder="Or paste an image URL…"
                type="url"
              />
              <button type="button" onClick={addPhotoUrl} className="btn btn-ghost shrink-0">
                <Plus size={15} /> Add
              </button>
            </div>
          </section>

          <section className="card p-6">
            <div className="flex items-center gap-3">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-forest text-xs font-bold text-cream">3</span>
              <h2 className="text-xl font-semibold">Description</h2>
            </div>
            <textarea
              className="input mt-5 min-h-40"
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Describe the home, the neighbourhood, what makes it special, and any house rules…"
              required
            />
            <p className="mt-2 text-xs text-ink/40">{form.description.length} characters</p>
          </section>

          <section className="card p-6">
            <div className="flex items-center gap-3">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-forest text-xs font-bold text-cream">4</span>
              <h2 className="text-xl font-semibold">Features & utilities</h2>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {AMENITIES.map((amenity) => (
                <button
                  type="button"
                  key={amenity}
                  onClick={() => toggleAmenity(amenity)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                    form.amenities.includes(amenity)
                      ? "border-forest bg-forest text-cream"
                      : "border-ink/12 bg-white text-ink/60 hover:border-forest/40"
                  }`}
                >
                  {amenity}
                </button>
              ))}
            </div>

            <div className="mt-3 flex gap-2">
              <input
                value={customAmenity}
                onChange={(e) => setCustomAmenity(e.target.value)}
                className="input"
                placeholder="Add another feature…"
              />
              <button
                type="button"
                className="btn btn-ghost shrink-0"
                onClick={() => {
                  if (!customAmenity.trim()) return;
                  toggleAmenity(customAmenity.trim());
                  setCustomAmenity("");
                }}
              >
                <Plus size={15} /> Add
              </button>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {[
                { key: "furnished" as const, label: "Furnished" },
                { key: "parking" as const, label: "Parking available" },
                { key: "water_included" as const, label: "Water included in rent" },
                { key: "electricity_included" as const, label: "Electricity included in rent" },
              ].map((toggle) => (
                <label key={toggle.key} className="flex cursor-pointer items-center justify-between rounded-xl border border-ink/10 bg-cream/50 px-4 py-3 text-sm">
                  <span>{toggle.label}</span>
                  <input
                    type="checkbox"
                    checked={form[toggle.key]}
                    onChange={(e) => set(toggle.key, e.target.checked)}
                    className="h-4 w-4 accent-forest"
                  />
                </label>
              ))}
            </div>

            {user?.role === "admin" && (
              <label className="mt-3 flex cursor-pointer items-center justify-between rounded-xl border border-gold/40 bg-gold/5 px-4 py-3 text-sm">
                <span className="inline-flex items-center gap-2"><Sparkles size={15} className="text-gold" /> Feature this listing</span>
                <input type="checkbox" checked={form.featured} onChange={(e) => set("featured", e.target.checked)} className="h-4 w-4 accent-forest" />
              </label>
            )}
          </section>
        </div>

        <aside>
          <div className="sticky top-32 space-y-4">
            <div className="card overflow-hidden">
              <div className="aspect-[4/3] bg-sand">
                {form.photos[0] ? (
                  <img src={form.photos[0]} alt="Cover preview" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full flex-col items-center justify-center gap-2 text-ink/35">
                    <Upload size={24} />
                    <span className="text-xs">Cover photo preview</span>
                  </div>
                )}
              </div>
              <div className="p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink/40">Preview</p>
                <h3 className="mt-2 line-clamp-2 font-semibold">{form.title || "Your listing title"}</h3>
                <p className="mt-1 flex items-center gap-1 text-xs text-ink/45">
                  <MapPin size={12} /> {form.location || "Area, City"}
                </p>
                <p className="mt-3 font-display text-2xl font-semibold text-forest">
                  {form.price ? money(form.price) : "P0"} <span className="text-xs font-normal text-ink/40">/ month</span>
                </p>
              </div>
            </div>

            <div className="rounded-3xl bg-mist p-5 text-sm">
              <p className="font-semibold text-forest">Tips for a strong listing</p>
              <ul className="mt-3 space-y-2 text-xs leading-relaxed text-ink/60">
                <li>Use daylight photos and include every room.</li>
                <li>Be clear about water, electricity and deposit terms.</li>
                <li>Mention nearby shops, transport and schools.</li>
                <li>Reply to enquiries quickly to build trust.</li>
              </ul>
            </div>

            <button type="submit" className="btn btn-primary w-full" disabled={save.isPending}>
              {save.isPending ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
              {isEdit ? "Save changes" : "Publish listing"}
            </button>
          </div>
        </aside>
      </form>
    </div>
  );
}
