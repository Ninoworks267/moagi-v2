import { useState, type ChangeEvent, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { Camera, Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { Avatar } from "../components/Avatar";
import { PageHeader } from "../components/UI";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import type { User } from "../lib/types";

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    first_name: user?.first_name ?? "",
    surname: user?.surname ?? "",
    phone: user?.phone ?? "",
    location: user?.location ?? "",
    gender: user?.gender ?? "",
    bio: user?.bio ?? "",
    avatar_url: user?.avatar_url ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  if (!user) return null;
  const currentUser = user;

  function set(key: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function uploadAvatar(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const data = new FormData();
      data.append("file", file);
      const result = await api<{ url: string }>("/uploads", { method: "POST", body: data });
      set("avatar_url", result.url);
      toast.success("Photo uploaded. Remember to save.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed.");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    try {
      const updated = await api<User>("/users/me", {
        method: "PATCH",
        body: { ...form, gender: form.gender || null },
      });
      updateUser(updated);
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      if (currentUser.role === "landlord") queryClient.invalidateQueries({ queryKey: ["landlord", currentUser.id] });
      toast.success("Profile saved.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save your profile.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="container-page pb-14">
      <PageHeader
        eyebrow="Your account"
        title="My profile"
        subtitle="A complete profile helps landlords and tenants trust you faster."
        actions={
          user.role === "landlord" ? (
            <Link to={`/landlords/${user.id}`} className="btn btn-ghost">View public profile</Link>
          ) : undefined
        }
      />

      <form onSubmit={submit} className="grid gap-6 lg:grid-cols-[340px_1fr]">
        <div className="space-y-4">
          <div className="card p-6 text-center">
            <div className="relative mx-auto w-fit">
              <Avatar avatarUrl={form.avatar_url || null} first={form.first_name || "M"} last={form.surname || "U"} size="xl" />
              <label className="absolute -bottom-1 -right-1 grid h-9 w-9 cursor-pointer place-items-center rounded-full bg-forest text-cream shadow-lg transition hover:bg-forest-light">
                {uploading ? <Loader2 size={15} className="animate-spin" /> : <Camera size={15} />}
                <input type="file" accept="image/jpeg,image/png,image/webp" onChange={uploadAvatar} className="hidden" disabled={uploading} />
              </label>
            </div>
            <h2 className="mt-4 text-xl font-semibold">{form.first_name} {form.surname}</h2>
            <p className="mt-1 text-xs capitalize text-ink/45">{user.role} · {form.location || "Botswana"}</p>
            <p className="mt-1 text-xs text-ink/40">{user.email}</p>
            <p className="mt-4 rounded-xl bg-cream px-3 py-2 text-[11px] text-ink/45">
              Profile photo, name, phone and bio are visible on your public profile.
            </p>
          </div>

          <div className="rounded-3xl bg-mist p-5 text-sm">
            <p className="font-semibold text-forest">Account safety</p>
            <ul className="mt-2 space-y-1.5 text-xs leading-relaxed text-ink/60">
              <li>MOAGI will never ask for your password.</li>
              <li>Keep conversations inside the platform.</li>
              <li>Report anything that feels wrong.</li>
            </ul>
            <Link to="/reports" className="link-underline mt-3 text-xs">Go to reporting</Link>
          </div>
        </div>

        <div className="space-y-5">
          <section className="card p-6">
            <h2 className="text-lg font-semibold">Personal details</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label">First name</label>
                <input className="input" value={form.first_name} onChange={(e) => set("first_name", e.target.value)} required />
              </div>
              <div>
                <label className="label">Surname</label>
                <input className="input" value={form.surname} onChange={(e) => set("surname", e.target.value)} required />
              </div>
              <div>
                <label className="label">Phone</label>
                <input className="input" value={form.phone} onChange={(e) => set("phone", e.target.value)} />
              </div>
              <div>
                <label className="label">Town / city</label>
                <input className="input" value={form.location} onChange={(e) => set("location", e.target.value)} required />
              </div>
              <div>
                <label className="label">Gender</label>
                <select className="input" value={form.gender} onChange={(e) => set("gender", e.target.value)}>
                  <option value="">Prefer not to say</option>
                  <option>Female</option>
                  <option>Male</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className="label">Profile photo URL</label>
                <input className="input" value={form.avatar_url} onChange={(e) => set("avatar_url", e.target.value)} placeholder="https://…" />
              </div>
            </div>
          </section>

          <section className="card p-6">
            <h2 className="text-lg font-semibold">About you</h2>
            <textarea
              className="input mt-4 min-h-32"
              value={form.bio}
              onChange={(e) => set("bio", e.target.value)}
              placeholder="Tell landlords or tenants a little about yourself…"
              maxLength={1200}
            />
            <div className="mt-4 flex justify-end">
              <button className="btn btn-primary" disabled={saving}>
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                Save profile
              </button>
            </div>
          </section>
        </div>
      </form>
    </div>
  );
}
