import { useQuery } from "@tanstack/react-query";
import { checkSession } from "../services/auth-service";
import { useAuthStore } from "@/common/stores/auth-store";

export const SESSION_KEY = ["auth", "session"] as const;

/**
 * Check the current auth session on app mount.
 *
 * Populates the common auth-store on success or clears it on failure.
 * Call this once from `AuthInitializer` in App.tsx.
 */
export function useSession() {
  const setUser = useAuthStore((s) => s.setUser);
  const setLoading = useAuthStore((s) => s.setLoading);

  return useQuery({
    queryKey: SESSION_KEY,
    queryFn: async () => {
      setLoading(true);
      try {
        const data = await checkSession();
        setUser(data.user);
        return data.user;
      } catch {
        setUser(null);
        setLoading(false);
        return null;
      }
    },
    staleTime: Infinity,          // Session only checked once on mount
    retry: false,
    refetchOnWindowFocus: false,
  });
}
