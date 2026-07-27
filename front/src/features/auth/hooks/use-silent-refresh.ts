import { useEffect, useRef } from "react";
import axios from "axios";
import { useAuthStore } from "@/common/stores/auth-store";

/**
 * Access token TTL in milliseconds (15 minutes).
 * Backend default: ACCESS_TOKEN_TTL_SECONDS=900.
 */
const ACCESS_TOKEN_TTL_MS = 15 * 60 * 1000;

/**
 * Refresh at 80% of the TTL to avoid any 401 gap (12 minutes).
 */
const REFRESH_INTERVAL_MS = Math.floor(ACCESS_TOKEN_TTL_MS * 0.8);

const BASE_URL = import.meta.env.DEV
  ? "/api/v1"
  : (import.meta.env.VITE_API_BASE_URL ?? "/api/v1");

/**
 * Proactive silent access-token refresh.
 *
 * Starts a periodic timer when the user is authenticated and clears it
 * on logout.  The refresh call sets new httpOnly cookies automatically;
 * the user never sees a login prompt or 401 blink.
 *
 * Must be mounted **after** the initial session check succeeds so we
 * don't refresh before we know who the user is.
 */
export function useSilentRefresh() {
  const user = useAuthStore((s) => s.user);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!user) {
      // User logged out or session expired — stop the timer.
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Start proactive refresh.
    intervalRef.current = setInterval(async () => {
      try {
        // Use a bare axios call (not the api wrapper) to bypass the
        // 401 interceptor — the refresh endpoint sets new cookies.
        await axios.post(
          `${BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true },
        );
      } catch {
        // Refresh failed (e.g., network, expired refresh token).
        // The next real API call will hit the 401 interceptor and
        // redirect to login if the refresh token is dead.
      }
    }, REFRESH_INTERVAL_MS);

    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [user]);
}
