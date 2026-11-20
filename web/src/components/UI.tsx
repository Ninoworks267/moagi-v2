import type { ReactNode } from "react";

export function PageHeader({
  eyebrow,
  title,
  subtitle,
  actions,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-5 pb-8 pt-12 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-2xl">
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1 className="mt-2 text-balance text-4xl font-semibold leading-[1.05] sm:text-5xl">{title}</h1>
        {subtitle && <p className="mt-4 text-balance text-ink/55">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  action,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div className="max-w-xl">
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h2 className="mt-2 text-balance text-3xl font-semibold sm:text-4xl">{title}</h2>
        {subtitle && <p className="mt-3 text-sm text-ink/55">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function StatCard({
  label,
  value,
  hint,
  icon,
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  icon?: ReactNode;
}) {
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink/45">{label}</p>
        {icon && <span className="text-forest/60">{icon}</span>}
      </div>
      <p className="mt-3 font-display text-4xl font-semibold text-forest">{value}</p>
      {hint && <p className="mt-1 text-xs text-ink/45">{hint}</p>}
    </div>
  );
}

export function StatusPill({ status }: { status: string }) {
  const tone: Record<string, string> = {
    open: "bg-gold/15 text-[#8a6414]",
    reviewing: "bg-clay/10 text-clay",
    resolved: "bg-forest/10 text-forest",
    dismissed: "bg-ink/8 text-ink/50",
    confirmed: "bg-forest/10 text-forest",
    active: "bg-forest/10 text-forest",
  };
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize ${tone[status] ?? "bg-ink/8 text-ink/60"}`}>
      {status}
    </span>
  );
}
