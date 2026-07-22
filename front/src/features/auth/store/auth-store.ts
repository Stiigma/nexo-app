import { create } from "zustand";

/**
 * Auth UI state — only for LoginPage-specific UI.
 *
 * The session state (user, loading, error) lives in
 * common/stores/auth-store.ts and is shared across the app.
 */
interface AuthUIState {
  showPassword: boolean;
  toggleShowPassword: () => void;
}

export const useAuthUIStore = create<AuthUIState>((set) => ({
  showPassword: false,
  toggleShowPassword: () => set((s) => ({ showPassword: !s.showPassword })),
}));
