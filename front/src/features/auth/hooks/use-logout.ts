import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { logout } from "../services/auth-service";
import { useAuthStore } from "@/common/stores/auth-store";

/**
 * End the current session.
 *
 * Calls the API and always clears the user from the store,
 * even if the API call fails.
 */
export function useLogout() {
  const setUser = useAuthStore((s) => s.setUser);
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async () => {
      try {
        await logout();
      } catch {
        // Logout should succeed even if the server call fails
      }
    },
    onSettled: () => {
      setUser(null);
      navigate("/login");
    },
  });
}
