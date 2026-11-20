import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "../lib/api";
import type { Property } from "../lib/types";
import { useAuth } from "../context/AuthContext";

export function useFavoriteToggle() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useCallback(
    async (property: Property) => {
      if (!user) {
        toast("Log in to save homes");
        navigate("/login");
        return;
      }
      try {
        if (property.is_favorite) {
          await api<void>(`/favorites/${property.id}`, { method: "DELETE" });
          toast("Removed from saved homes");
        } else {
          await api<void>(`/favorites/${property.id}`, { method: "POST" });
          toast.success("Saved to your homes");
        }
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ["properties"] }),
          queryClient.invalidateQueries({ queryKey: ["property", property.id] }),
          queryClient.invalidateQueries({ queryKey: ["favorites"] }),
          queryClient.invalidateQueries({ queryKey: ["dashboard"] }),
          queryClient.invalidateQueries({ queryKey: ["landlord"] }),
        ]);
      } catch {
        toast.error("Could not update saved homes.");
      }
    },
    [user, navigate, queryClient],
  );
}
