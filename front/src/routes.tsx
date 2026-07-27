import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { AppShell } from "@/common/components/layout/AppShell";
import { AuthGuard } from "@/common/components/guards/AuthGuard";
import { useAuthStore } from "@/common/stores/auth-store";
import { LoginPage } from "@/features/auth/views/LoginPage";
import { SetPasswordPage } from "@/features/auth/views/SetPasswordPage";
import { CatalogsPage } from "@/features/catalogs/views/CatalogsPage";
import { InventoryPage } from "@/features/inventory/views/InventoryPage";
import { UsersPage } from "@/features/admin/users/views/UsersPage";
import { CapturePage } from "@/features/capture/views/CapturePage";

function ProtectedLayout() {
  return (
    <AuthGuard>
      <AppShell>
        <Outlet />
      </AppShell>
    </AuthGuard>
  );
}

function AdminLayout() {
  return (
    <AuthGuard roles={["Admin"]}>
      <Outlet />
    </AuthGuard>
  );
}

function PlaceholderPage({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <h3 className="mb-2 text-lg font-semibold text-foreground">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

/**
 * Root route redirect:
 * - Not authenticated → /login
 * - Admin → /admin/catalogs
 * - Operator → /capture
 */
function RootRedirect() {
  const user = useAuthStore((s) => s.user);
  const isLoading = useAuthStore((s) => s.isLoading);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">Cargando sesión...</p>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (user.role === "Admin") return <Navigate to="/admin/catalogs" replace />;
  return <Navigate to="/capture" replace />;
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/set-password" element={<SetPasswordPage />} />

        {/* Root: unauthenticated → /login, authenticated → default dashboard */}
        <Route path="/" element={<RootRedirect />} />

        <Route element={<ProtectedLayout />}>
          {/* Operator + Admin */}
          <Route
            path="capture"
            element={<CapturePage />}
          />
          <Route
            path="inventory"
            element={<InventoryPage />}
          />

          {/* Admin only */}
          <Route element={<AdminLayout />}>
            <Route
              path="admin"
              element={<Navigate to="/admin/catalogs" replace />}
            />
            <Route
              path="admin/inventory"
              element={<InventoryPage />}
            />
            <Route
              path="admin/catalogs"
              element={<CatalogsPage />}
            />
            <Route
              path="admin/users"
              element={<UsersPage />}
            />
            <Route
              path="admin/reports"
              element={
                <PlaceholderPage
                  title="Reportes"
                  description="Reportes internos de compras, ventas, gastos e inventario."
                />
              }
            />
            <Route
              path="admin/corrections"
              element={
                <PlaceholderPage
                  title="Correcciones"
                  description="Correcciones administrativas con trazabilidad."
                />
              }
            />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
