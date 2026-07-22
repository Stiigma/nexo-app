import { useState, useEffect, useCallback } from "react";
import { Loader2, ShieldCheck, RotateCcw } from "lucide-react";
import { Input } from "@/common/components/ui/input";
import { Label } from "@/common/components/ui/label";
import { Button } from "@/common/components/ui/button";
import {
  useVerifyCode,
  useSendCode,
} from "../../hooks/use-set-password";

interface CodeVerificationFormProps {
  email: string;
  onVerified: (token: string, expiresAt?: string) => void;
}

const CODE_LENGTH = 6;
const RESEND_COOLDOWN_SECONDS = 60;

export function CodeVerificationForm({
  email,
  onVerified,
}: CodeVerificationFormProps) {
  const [code, setCode] = useState("");
  const verifyCodeMutation = useVerifyCode();
  const resendCodeMutation = useSendCode();
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_SECONDS);

  // Countdown timer for resend cooldown
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleResend = useCallback(async () => {
    if (cooldown > 0) return;
    resendCodeMutation.reset();
    try {
      await resendCodeMutation.mutateAsync(email);
      setCooldown(RESEND_COOLDOWN_SECONDS);
    } catch {
      // Error will be visible via mutation state
    }
  }, [cooldown, email, resendCodeMutation]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    verifyCodeMutation.reset();

    try {
      const result = await verifyCodeMutation.mutateAsync({ email, code });
      onVerified(result.tempToken, result.expiresAt);
    } catch {
      // Error displayed below
    }
  }

  const isLoading = verifyCodeMutation.isPending;
  const error = verifyCodeMutation.error as Error | null;
  const resendError = resendCodeMutation.error as Error | null;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="sp-code">Código de verificación</Label>
        <Input
          id="sp-code"
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={CODE_LENGTH}
          value={code}
          onChange={(e) => {
            const val = e.target.value.replace(/\D/g, "").slice(0, CODE_LENGTH);
            setCode(val);
          }}
          placeholder="000000"
          required
          autoComplete="one-time-code"
          disabled={isLoading}
          className="tracking-[0.5em] text-center text-lg"
        />
        <p className="text-xs text-muted-foreground">
          Ingresa el código de 6 dígitos enviado a{" "}
          <span className="font-medium text-foreground">{email}</span>
        </p>
      </div>

      {(error || resendError) && (
        <div
          role="alert"
          className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          {error?.message || resendError?.message}
        </div>
      )}

      <Button
        type="submit"
        className="w-full"
        disabled={isLoading || code.length !== CODE_LENGTH}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <ShieldCheck className="h-4 w-4" />
        )}
        {isLoading ? "Verificando..." : "Verificar código"}
      </Button>

      <div className="text-center">
        <Button
          type="button"
          variant="link"
          size="sm"
          onClick={handleResend}
          disabled={cooldown > 0 || resendCodeMutation.isPending}
          className="text-xs"
        >
          <RotateCcw className="h-3 w-3" />
          {cooldown > 0
            ? `Reenviar código en ${cooldown}s`
            : "Reenviar código"}
        </Button>
      </div>
    </form>
  );
}
