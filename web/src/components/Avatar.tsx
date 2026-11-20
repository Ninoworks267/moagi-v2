import { initials } from "../lib/format";

interface AvatarProps {
  avatarUrl?: string | null;
  first: string;
  last: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizes = {
  sm: "h-8 w-8 text-[11px]",
  md: "h-11 w-11 text-sm",
  lg: "h-16 w-16 text-lg",
  xl: "h-24 w-24 text-2xl",
};

export function Avatar({ avatarUrl, first, last, size = "md", className = "" }: AvatarProps) {
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-ink/10 bg-mist font-semibold text-forest ${sizes[size]} ${className}`}
    >
      {avatarUrl ? (
        <img src={avatarUrl} alt={`${first} ${last}`} className="h-full w-full object-cover" loading="lazy" />
      ) : (
        initials(first, last)
      )}
    </span>
  );
}
