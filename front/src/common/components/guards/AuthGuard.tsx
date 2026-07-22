import { ReactNode, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/common/stores/auth-store";
import type { UserRole } from "@/common/types";

interface AuthGuardProps {
  roles?: UserRole[];
  children: ReactNode;
}

export function AuthGuard({ roles, children }: AuthGuardProps) {
  const user = useAuthStore((s) => s.user);
  const isLoading = useAuthStore((s) => s.isLoading);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/login", { replace: true });
    }
  }, [user, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="panel">
        <p>Cargando sesión...</p>
      </div>
    );
  }

  if (!user) return null;

  if (roles && !roles.includes(user.role)) {
    return (
      <div className="panel">
        <p>Acceso denegado. No tienes los permisos necesarios.</p>
      </div>
    );
  }

  return <>{children}</>;
}
