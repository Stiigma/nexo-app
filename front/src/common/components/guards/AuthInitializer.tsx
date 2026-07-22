import { ReactNode } from "react";
import { useSession } from "@/features/auth/hooks/use-session";
import { useSilentRefresh } from "@/features/auth/hooks/use-silent-refresh";

interface AuthInitializerProps {
  children: ReactNode;
}

/**
 * Checks the session once on app mount and starts proactive token refresh.
 *
 * Must be rendered inside a QueryClientProvider.
 */
export function AuthInitializer({ children }: AuthInitializerProps) {
  useSession();
  useSilentRefresh();
  return <>{children}</>;
}
