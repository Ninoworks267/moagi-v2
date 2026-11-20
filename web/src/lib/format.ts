export function money(value: number, suffix = ""): string {
  const formatted = new Intl.NumberFormat("en-BW", {
    maximumFractionDigits: 0,
  }).format(value);
  return `P${formatted}${suffix}`;
}

export function fullName(user: { first_name: string; surname: string }): string {
  return `${user.first_name} ${user.surname}`;
}

export function initials(first: string, last: string): string {
  return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
}

export function formatDate(value: string, opts?: Intl.DateTimeFormatOptions): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-BW", opts ?? { day: "numeric", month: "short", year: "numeric" }).format(date);
}

export function timeAgo(value: string): string {
  const date = new Date(value).getTime();
  const seconds = Math.max(1, Math.floor((Date.now() - date) / 1000));
  const units: [number, string][] = [
    [60, "second"],
    [60, "minute"],
    [24, "hour"],
    [7, "day"],
    [4.35, "week"],
    [12, "month"],
    [Number.POSITIVE_INFINITY, "year"],
  ];
  let amount = seconds;
  for (const [factor, name] of units) {
    if (amount < factor) {
      const rounded = Math.max(1, Math.floor(amount));
      return `${rounded} ${name}${rounded === 1 ? "" : "s"} ago`;
    }
    amount /= factor;
  }
  return "just now";
}

export function nightsBetween(checkin: string, checkout: string): number {
  const start = new Date(checkin).getTime();
  const end = new Date(checkout).getTime();
  if (Number.isNaN(start) || Number.isNaN(end)) return 0;
  return Math.max(0, Math.round((end - start) / 86_400_000));
}

export function todayISO(offsetDays = 0): string {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  return date.toISOString().slice(0, 10);
}

export function titleCase(value: string): string {
  return value.replace(/[-_]/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}
