import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Heart } from "lucide-react";
import { PageHeader } from "../components/UI";
import { PropertyCard } from "../components/PropertyCard";
import { EmptyState } from "../components/EmptyState";
import { SectionSkeleton } from "../components/Skeletons";
import { api } from "../lib/api";
import type { Property } from "../lib/types";

export default function FavoritesPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["favorites"],
    queryFn: () => api<Property[]>("/favorites"),
  });

  return (
    <div className="container-page pb-12">
      <PageHeader
        eyebrow="Your shortlist"
        title="Saved homes"
        subtitle="Homes you've bookmarked. Tap the heart on a listing to add or remove it."
        actions={<Link to="/houses" className="btn btn-ghost">Browse more homes</Link>}
      />

      {isLoading ? (
        <SectionSkeleton count={3} />
      ) : data && data.length > 0 ? (
        <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<Heart size={24} />}
          title="Your shortlist is empty"
          description="Save homes you love and compare them side by side whenever you're ready."
          action={<Link to="/houses" className="btn btn-primary">Find homes</Link>}
        />
      )}
    </div>
  );
}
