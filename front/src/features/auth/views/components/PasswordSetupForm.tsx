import { useState } from "react";
import { Loader2, Lock, Eye, EyeOff, Clock } from "lucide-react";
import { Input } from "@/common/components/ui/input";
import { Label } from "@/common/components/ui/label";
import { Button } from "@/common/components/ui/button";
import { useSetPassword } from "../../hooks/use-set-password";
import { PasswordStrengthIndicator } from "./PasswordStrengthIndicator";

interface PasswordSetupFormProps {
  email: string;
  tempToken: string;
  timeLeft: number;
  expiresAt: Date;
  onSuccess: () => void;
}

export function PasswordSetupForm({ email, tempToken, timeLeft, expiresAt, onSuccess }: PasswordSetupFormProps) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const setPasswordMutation = useSetPassword();

  const passwordsMatch = password === confirmPassword;
  const confirmTouched = confirmPassword.length > 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPasswordMutation.reset();

    try {
      await setPasswordMutation.mutateAsync({ email, password, tempToken });
      onSuccess();
    } catch {
      // Error displayed below
    }
  }

  const isLoading = setPasswordMutation.isPending;
  const error = setPasswordMutation.error as Error | null;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Countdown Timer */}
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock
              className={`h-4 w-4 ${timeLeft < 180 ? "text-destructive" : "text-muted-foreground"}`}
            />
            <span className="text-sm text-muted-foreground">
              Tiempo restante para establecer tu contraseña:
            </span>
          </div>
          <span
            className={`font-mono text-lg font-bold ${
              timeLeft < 180
                ? "text-destructive"
                : timeLeft < 600
                  ? "text-yellow-600"
                  : "text-foreground"
            }`}
          >
            {Math.floor(timeLeft / 60)}:
            {(timeLeft % 60).toString().padStart(2, "0")}
          </span>
        </div>

        {/* Progress bar */}
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={`h-full rounded-full transition-all duration-1000 ${
              timeLeft < 180
                ? "bg-destructive"
                : timeLeft < 600
                  ? "bg-yellow-500"
                  : "bg-primary"
            }`}
            style={{ width: `${(timeLeft / 900) * 100}%` }}
          />
        </div>

        {timeLeft < 180 && (
          <p className="mt-2 text-xs text-destructive">
            ⚠️ Tu sesión expirará pronto. Guarda tu contraseña antes de que se
            agote el tiempo.
          </p>
        )}
      </div>

      {/* New password */}
      <div className="space-y-1.5">
        <Label htmlFor="sp-password">Nueva contraseña</Label>
        <div className="relative">
          <Input
            id="sp-password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            autoComplete="new-password"
            disabled={isLoading}
            className="pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
        <PasswordStrengthIndicator password={password} />
      </div>

      {/* Confirm password */}
      <div className="space-y-1.5">
        <Label htmlFor="sp-confirm">Confirmar contraseña</Label>
        <div className="relative">
          <Input
            id="sp-confirm"
            type={showConfirm ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            required
            autoComplete="new-password"
            disabled={isLoading}
            className="pr-10"
          />
          <button
            type="button"
            onClick={() => setShowConfirm(!showConfirm)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            tabIndex={-1}
          >
            {showConfirm ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
        {confirmTouched && !passwordsMatch && (
          <p className="text-xs text-destructive">
            Las contraseñas no coinciden.
          </p>
        )}
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          {error.message}
        </div>
      )}

      <Button
        type="submit"
        className="w-full"
        disabled={isLoading || !password || !passwordsMatch}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Lock className="h-4 w-4" />
        )}
        {isLoading ? "Guardando..." : "Guardar contraseña"}
      </Button>
    </form>
  );
}
