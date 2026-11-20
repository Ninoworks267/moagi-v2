import { createContext, useCallback, useContext, useMemo, type ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import type { Role, User } from "../lib/types";

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (payload: RegisterPayload) => Promise<User>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
  isAuthenticated: boolean;
}

export interface RegisterPayload {
  first_name: string;
  surname: string;
  email: string;
  phone: string;
  password: string;
  role: Exclude<Role, "admin">;
  location: string;
  citizenship: string;
  gender?: string;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery<User | null>({
    queryKey: ["me"],
    queryFn: async () => {
      try {
        return await api<User>("/auth/me");
      } catch {
        return null;
      }
    },
    staleTime: 60_000,
    retry: false,
  });

  const login = useCallback(
    async (email: string, password: string) => {
      const user = await api<User>("/auth/login", { method: "POST", body: { email, password } });
      queryClient.setQueryData(["me"], user);
      return user;
    },
    [queryClient],
  );

  const register = useCallback(
    async (payload: RegisterPayload) => {
      const user = await api<User>("/auth/register", { method: "POST", body: payload });
      queryClient.setQueryData(["me"], user);
      return user;
    },
    [queryClient],
  );

  const logout = useCallback(async () => {
    await api<void>("/auth/logout", { method: "POST" });
    queryClient.setQueryData(["me"], null);
    queryClient.clear();
    queryClient.setQueryData(["me"], null);
  }, [queryClient]);

  const updateUser = useCallback(
    (user: User) => queryClient.setQueryData(["me"], user),
    [queryClient],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user: data ?? null,
      isLoading,
      login,
      register,
      logout,
      updateUser,
      isAuthenticated: Boolean(data),
    }),
    [data, isLoading, login, register, logout, updateUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
