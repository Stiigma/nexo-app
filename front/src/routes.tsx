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
import { DashboardPage } from "@/features/dashboard/views/DashboardPage";
import { GiveawaysPage } from "@/features/giveaways/views/GiveawaysPage";
import { GiveawayDetailPage } from "@/features/giveaways/views/GiveawayDetailPage";

/**
 * Shared layout:  user must be authenticated (any role).
 * Route-level role guards are applied per-route via AuthGuard or
 * the AdminLayout wrapper.
 */
function ProtectedLayout() {
  return (
    <AuthGuard>
      <AppShell>
        <Outlet />
      </AppShell>
    </AuthGuard>
  );
}

/**
 * Admin-only layout:  wraps routes that require the Admin role.
 */
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
 * Root redirect:
 * - Not authenticated → /login
 * - Any authenticated role → /inventory (dashboard general)
 */
function RootRedirect() {
  const user = useAuthStore((s) => s.user);
  const isLoading = useAuthStore((s) => s.isLoading);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">Cargando sesión…</p>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to="/dashboard" replace />;
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/set-password" element={<SetPasswordPage />} />

        {/* Root redirect */}
        <Route path="/" element={<RootRedirect />} />

        {/* Authenticated routes (any role) */}
        <Route element={<ProtectedLayout />}>
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="capture" element={<CapturePage />} />
          <Route path="inventory" element={<InventoryPage />} />
          <Route path="catalogs" element={<CatalogsPage />} />

          {/* Admin-only routes */}
          <Route element={<AdminLayout />}>
            <Route
              path="admin"
              element={<Navigate to="/catalogs" replace />}
            />
            <Route path="admin/giveaways" element={<GiveawaysPage />} />
            <Route path="admin/giveaways/:id" element={<GiveawayDetailPage />} />
            <Route path="admin/users" element={<UsersPage />} />
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
