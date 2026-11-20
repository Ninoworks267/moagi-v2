import { useState, type FormEvent } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { Eye, EyeOff, LockKeyhole, Mail, ShieldCheck, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";

const DEMOS = [
  { label: "Tenant", email: "tenant@moagi.demo" },
  { label: "Landlord", email: "kago@moagi.demo" },
  { label: "Admin", email: "admin@moagi.demo" },
];

export default function LoginPage() {
  const { login, user, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const from = (location.state as { from?: string } | null)?.from ?? "/dashboard";

  if (!isLoading && user) return <Navigate to={from} replace />;

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const account = await login(email, password);
      toast.success(`Welcome back, ${account.first_name}.`);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not log in.");
    } finally {
      setSubmitting(false);
    }
  }

  function fillDemo(demoEmail: string) {
    setEmail(demoEmail);
    setPassword("Moagi123!");
    setError("");
  }

  return (
    <div className="container-page py-10 sm:py-14">
      <div className="grid overflow-hidden rounded-[32px] border border-ink/10 bg-white lg:grid-cols-2">
        <div className="relative hidden min-h-[640px] lg:block">
          <img
            src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80"
            alt="A warm, sunlit living room"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/35 to-transparent" />
          <div className="relative z-10 flex h-full flex-col justify-between p-10">
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-cream/25 bg-white/10 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-cream backdrop-blur">
              <Sparkles size={13} className="text-gold" /> Welcome back
            </span>
            <div>
              <h2 className="text-balance font-display text-4xl font-semibold leading-tight text-cream">
                Your next chapter is one login away.
              </h2>
              <p className="mt-4 max-w-sm text-sm leading-relaxed text-cream/65">
                Pick up your conversations, saved homes and listings exactly where you left them.
              </p>
              <p className="mt-8 flex items-center gap-2 text-xs text-cream/50">
                <ShieldCheck size={14} className="text-gold" /> Secure sessions · Your data stays yours
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-center p-6 sm:p-12">
          <div className="mx-auto w-full max-w-sm">
            <p className="eyebrow">Account</p>
            <h1 className="mt-2 text-3xl font-semibold">Log in to MOAGI</h1>
            <p className="mt-2 text-sm text-ink/50">
              New here?{" "}
              <Link to="/register" className="font-semibold text-forest hover:underline">Create an account</Link>
            </p>

            <form onSubmit={submit} className="mt-8 space-y-4">
              <div>
                <label className="label" htmlFor="email">Email</label>
                <div className="relative">
                  <Mail size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink/35" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="input pl-11"
                    autoComplete="email"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="label" htmlFor="password">Password</label>
                <div className="relative">
                  <LockKeyhole size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink/35" />
                  <input
                    id="password"
                    type={show ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Your password"
                    className="input px-11"
                    autoComplete="current-password"
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
              </div>

              {error && <p className="rounded-xl bg-clay/8 px-4 py-3 text-sm text-clay">{error}</p>}

              <button type="submit" className="btn btn-primary w-full" disabled={submitting}>
                {submitting ? "Logging in…" : "Log in"}
              </button>
            </form>

            <div className="mt-7 rounded-2xl border border-ink/10 bg-cream p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink/45">Try a demo account</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {DEMOS.map((demo) => (
                  <button
                    key={demo.email}
                    onClick={() => fillDemo(demo.email)}
                    className="rounded-full border border-ink/12 bg-white px-3 py-1.5 text-xs font-medium text-ink/65 transition hover:border-forest hover:text-forest"
                  >
                    {demo.label}
                  </button>
                ))}
              </div>
              <p className="mt-2 text-[11px] text-ink/40">Password for all demos: Moagi123!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
