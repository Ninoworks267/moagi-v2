import { BadgePercent, BookOpen, type LucideIcon } from "lucide-react";

export interface CategoryDef {
  value: string;
  label: string;
  blurb: string;
  icon?: LucideIcon;
  symbol?: string;
}

export const CATEGORIES: CategoryDef[] = [
  {
    value: "promo",
    label: "Promo",
    blurb: "Deals, discounts and move-in specials.",
    icon: BadgePercent,
  },
  {
    value: "students",
    label: "Students",
    blurb: "Study-ready homes close to campus.",
    icon: BookOpen,
  },
  {
    value: "women",
    label: "Women",
    blurb: "Women-only and women-led safe spaces.",
    symbol: "♀",
  },
  {
    value: "men",
    label: "Men",
    blurb: "Men-only flats, pads and shared homes.",
    symbol: "♂",
  },
];

export function categoryLabel(value: string): string {
  return CATEGORIES.find((category) => category.value === value)?.label ?? "Everyone";
}

export function categoryDef(value: string): CategoryDef | undefined {
  return CATEGORIES.find((category) => category.value === value);
}

export function CategoryMark({ category, size = 16 }: { category: CategoryDef; size?: number }) {
  const Icon = category.icon;
  if (Icon) return <Icon size={size} strokeWidth={2.1} aria-hidden />;
  return (
    <span
      aria-hidden
      className="inline-flex items-center justify-center font-semibold leading-none"
      style={{ fontSize: size + 3 }}
    >
      {category.symbol}
    </span>
  );
}
