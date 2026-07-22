import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Loader2, KeyRound } from "lucide-react";
import { useAuthStore } from "@/common/stores/auth-store";
import { useLogin } from "../hooks/use-login";
import { useCheckEmail } from "../hooks/use-set-password";
import { Input } from "@/common/components/ui/input";
import { Label } from "@/common/components/ui/label";
import { Button } from "@/common/components/ui/button";

export function LoginPage() {
  const error = useAuthStore((s) => s.error);
  const clearError = useAuthStore((s) => s.clearError);
  const loginMutation = useLogin();
  const checkEmailMutation = useCheckEmail();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [needsPassword, setNeedsPassword] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    clearError();
    setNeedsPassword(false);

    try {
      await loginMutation.mutateAsync({ email, password });
      navigate("/");
    } catch (err) {
      // If login fails, check if the user needs to set a password
      try {
        const result = await checkEmailMutation.mutateAsync(email);
        if (result.exists && !result.hasPassword) {
          setNeedsPassword(true);
          return;
        }
      } catch {
        // Original login error is already shown via the store
      }
    }
  }

  const isLoading = loginMutation.isPending || checkEmailMutation.isPending;

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-foreground">Nexo</h1>
          <p className="mt-1 text-xs font-bold uppercase tracking-wide text-muted-foreground">
            Operaciones
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-lg border border-border bg-card p-6 shadow-sm"
        >
          <h2 className="text-lg font-semibold text-foreground">Iniciar sesión</h2>

          {error && (
            <div
              role="alert"
              className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
            >
              {error}
            </div>
          )}

          {needsPassword && (
            <div
              role="status"
              className="rounded-md border border-primary/30 bg-primary/10 px-4 py-3 text-sm text-primary"
            >
              <p className="mb-2">Tu cuenta aún no tiene contraseña configurada.</p>
              <Button asChild size="sm" variant="outline">
                <Link to="/set-password">
                  <KeyRound className="h-4 w-4" />
                  Configurar contraseña
                </Link>
              </Button>
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="email">Correo</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="usuario@nexo.com"
              required
              autoComplete="email"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
              disabled={isLoading}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            {isLoading ? "Ingresando..." : "Ingresar"}
          </Button>
        </form>

        <div className="mt-4 text-center">
          <p className="text-sm text-muted-foreground">
            ¿Primera vez?{" "}
            <Link
              to="/set-password"
              className="text-primary hover:underline font-medium"
            >
              Configura tu contraseña
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
