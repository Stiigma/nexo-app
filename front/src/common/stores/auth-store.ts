import { create } from "zustand";
import type { AuthUser } from "@/common/types";

/**
 * Auth session state.
 *
 * This store holds the authenticated user and session lifecycle flags.
 * It is populated by `AuthInitializer` (in App.tsx) which calls the
 * TanStack Query hooks from `features/auth/hooks/`.
 *
 * The store itself does NOT call any API — it only holds state.
 */
interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  error: string | null;

  /** Called by AuthInitializer and login hook on success */
  setUser: (user: AuthUser | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  error: null,

  setUser: (user) => set({ user, isLoading: false, error: null }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error, isLoading: false }),
  clearError: () => set({ error: null }),
}));
