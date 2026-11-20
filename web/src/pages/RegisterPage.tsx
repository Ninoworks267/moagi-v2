import { useState, type FormEvent } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { Building2, Eye, EyeOff, Home, KeyRound, LockKeyhole, Mail, Phone, UserRound } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";

export default function RegisterPage() {
  const { register, user, isLoading } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const initialRole = params.get("role") === "landlord" ? "landlord" : "tenant";

  const [form, setForm] = useState({
    first_name: "",
    surname: "",
    email: "",
    phone: "",
    password: "",
    location: "Gaborone",
    citizenship: "Botswana",
    gender: "",
    role: initialRole as "tenant" | "landlord",
  });
  const [show, setShow] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!isLoading && user) return <Navigate to="/dashboard" replace />;

  function set(key: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const account = await register({
        ...form,
        role: form.role,
        gender: form.gender || undefined,
      });
      toast.success(`Welcome to MOAGI, ${account.first_name}.`);
      navigate("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create your account.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="container-page py-10 sm:py-14">
      <div className="grid overflow-hidden rounded-[32px] border border-ink/10 bg-white lg:grid-cols-[0.9fr_1.1fr]">
        <div className="relative hidden min-h-[720px] lg:block">
          <img
            src="https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1200&q=80"
            alt="A calm, modern home interior"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/35 to-transparent" />
          <div className="relative z-10 flex h-full flex-col justify-between p-10">
            <span className="font-display text-2xl font-extrabold text-cream">
              MOAGI<span className="text-gold">.</span>
            </span>
            <div>
              <h2 className="text-balance font-display text-4xl font-semibold leading-tight text-cream">
                A better way to move in Botswana.
              </h2>
              <p className="mt-4 max-w-sm text-sm leading-relaxed text-cream/65">
                Join as a tenant to find your next home, or as a landlord to list with confidence.
              </p>
              <div className="mt-8 grid grid-cols-2 gap-4 border-t border-cream/20 pt-6 text-cream/70">
                <div><p className="font-display text-2xl font-semibold text-cream">Free</p><p className="mt-1 text-xs">to join and browse</p></div>
                <div><p className="font-display text-2xl font-semibold text-cream">Direct</p><p className="mt-1 text-xs">messages, no agents</p></div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-10 lg:p-12">
          <div className="mx-auto w-full max-w-xl">
            <p className="eyebrow">Join MOAGI</p>
            <h1 className="mt-2 text-3xl font-semibold">Create your account</h1>
            <p className="mt-2 text-sm text-ink/50">
              Already have an account?{" "}
              <Link to="/login" className="font-semibold text-forest hover:underline">Log in</Link>
            </p>

            <div className="mt-7 grid grid-cols-2 gap-3">
              {[
                { value: "tenant", icon: <Home size={18} />, title: "I'm a tenant", note: "Find a home to rent" },
                { value: "landlord", icon: <Building2 size={18} />, title: "I'm a landlord", note: "List and manage homes" },
              ].map((option) => (
                <button
                  type="button"
                  key={option.value}
                  onClick={() => set("role", option.value)}
                  className={`rounded-2xl border p-4 text-left transition ${
                    form.role === option.value
                      ? "border-forest bg-forest/5 ring-2 ring-forest/15"
                      : "border-ink/12 hover:border-forest/40"
                  }`}
                >
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-forest text-cream">{option.icon}</span>
                  <p className="mt-3 text-sm font-semibold">{option.title}</p>
                  <p className="mt-0.5 text-xs text-ink/45">{option.note}</p>
                </button>
              ))}
            </div>

            <form onSubmit={submit} className="mt-6 space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="label" htmlFor="first_name">First name</label>
                  <div className="relative">
                    <UserRound size={15} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink/35" />
                    <input id="first_name" className="input pl-10" value={form.first_name} onChange={(e) => set("first_name", e.target.value)} required />
                  </div>
                </div>
                <div>
                  <label className="label" htmlFor="surname">Surname</label>
                  <input id="surname" className="input" value={form.surname} onChange={(e) => set("surname", e.target.value)} required />
                </div>
              </div>

              <div>
                <label className="label" htmlFor="email">Email</label>
                <div className="relative">
                  <Mail size={15} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink/35" />
                  <input id="email" type="email" className="input pl-10" value={form.email} onChange={(e) => set("email", e.target.value)} autoComplete="email" required />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="label" htmlFor="phone">Phone</label>
                  <div className="relative">
                    <Phone size={15} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink/35" />
                    <input id="phone" className="input pl-10" placeholder="+267 …" value={form.phone} onChange={(e) => set("phone", e.target.value)} required />
                  </div>
                </div>
                <div>
                  <label className="label" htmlFor="location">Town / city</label>
                  <input id="location" className="input" value={form.location} onChange={(e) => set("location", e.target.value)} required />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="label" htmlFor="citizenship">Citizenship</label>
                  <input id="citizenship" className="input" value={form.citizenship} onChange={(e) => set("citizenship", e.target.value)} />
                </div>
                <div>
                  <label className="label" htmlFor="gender">Gender (optional)</label>
                  <select id="gender" className="input" value={form.gender} onChange={(e) => set("gender", e.target.value)}>
                    <option value="">Prefer not to say</option>
                    <option>Female</option>
                    <option>Male</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="label" htmlFor="password">Password</label>
                <div className="relative">
                  <LockKeyhole size={15} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink/35" />
                  <input
                    id="password"
                    type={show ? "text" : "password"}
                    className="input px-10"
                    value={form.password}
                    onChange={(e) => set("password", e.target.value)}
                    minLength={8}
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShow((value) => !value)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-ink/35 hover:text-forest"
                    aria-label={show ? "Hide password" : "Show password"}
                  >
                    {show ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
                <p className="mt-1.5 text-[11px] text-ink/40">At least 8 characters.</p>
              </div>

              {error && <p className="rounded-xl bg-clay/8 px-4 py-3 text-sm text-clay">{error}</p>}

              <button type="submit" className="btn btn-primary w-full" disabled={submitting}>
                <KeyRound size={16} />
                {submitting ? "Creating account…" : "Create account"}
              </button>
              <p className="text-center text-[11px] leading-relaxed text-ink/40">
                By joining you agree to treat other members with respect and to keep viewings safe.
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
