import { useMutation } from "@tanstack/react-query";
import { login } from "../services/auth-service";
import { useAuthStore } from "@/common/stores/auth-store";
import type { LoginPayload } from "../services/auth-service";

/**
 * Authenticate user.
 *
 * On success, populates the common auth-store with the user data.
 * On failure, sets the error in the store.
 */
export function useLogin() {
  const setUser = useAuthStore((s) => s.setUser);
  const setError = useAuthStore((s) => s.setError);

  return useMutation({
    mutationFn: (payload: LoginPayload) => login(payload),
    onSuccess: (data) => {
      setUser(data.user);
    },
    onError: (err: Error) => {
      setError(err.message);
    },
  });
}
