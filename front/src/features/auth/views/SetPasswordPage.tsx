import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, ArrowLeft } from "lucide-react";
import { Button } from "@/common/components/ui/button";
import { toast } from "sonner";
import { EmailVerificationForm } from "./components/EmailVerificationForm";
import { CodeVerificationForm } from "./components/CodeVerificationForm";
import { PasswordSetupForm } from "./components/PasswordSetupForm";

type Step = "email" | "code" | "password" | "success";

const STEPS: { key: Step; label: string }[] = [
  { key: "email", label: "Correo" },
  { key: "code", label: "Verificar" },
  { key: "password", label: "Contraseña" },
];

function StepIndicator({
  currentStep,
}: {
  currentStep: Step;
}) {
  const currentIdx = STEPS.findIndex((s) => s.key === currentStep);
  if (currentIdx < 0) return null;

  return (
    <div className="flex items-center justify-center gap-2">
      {STEPS.map((step, i) => (
        <div key={step.key} className="flex items-center gap-2">
          <div
            className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium transition-colors ${
              i < currentIdx
                ? "bg-primary text-primary-foreground"
                : i === currentIdx
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
            }`}
          >
            {i < currentIdx ? "✓" : i + 1}
          </div>
          {i < STEPS.length - 1 && (
            <div
              className={`h-px w-8 ${
                i < currentIdx ? "bg-primary" : "bg-muted"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

export function SetPasswordPage() {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);

  // Countdown timer effect
  useEffect(() => {
    if (!expiresAt) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const remaining = Math.max(
        0,
        Math.floor((expiresAt.getTime() - now) / 1000)
      );
      setTimeLeft(remaining);

      if (remaining <= 0) {
        clearInterval(interval);
        // Redirect back to email step
        setStep("email");
        setToken("");
        setEmail("");
        setExpiresAt(null);
        setTimeLeft(0);
        toast.error(
          "Tu sesión ha expirado. Por favor, solicita un nuevo código."
        );
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-foreground">Nexo</h1>
          <p className="mt-1 text-xs font-bold uppercase tracking-wide text-muted-foreground">
            Operaciones
          </p>
        </div>

        {/* Card */}
        <div className="space-y-6 rounded-lg border border-border bg-card p-6 shadow-sm">
          {/* Step indicator */}
          {step !== "success" && <StepIndicator currentStep={step} />}

          {/* Step title */}
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              {step === "email" && "Configurar contraseña"}
              {step === "code" && "Verificar correo"}
              {step === "password" && "Nueva contraseña"}
              {step === "success" && "¡Listo!"}
            </h2>
            {step === "email" && (
              <p className="mt-1 text-sm text-muted-foreground">
                Ingresa tu correo para comenzar.
              </p>
            )}
            {step === "code" && (
              <p className="mt-1 text-sm text-muted-foreground">
                Revisa tu bandeja de entrada.
              </p>
            )}
            {step === "password" && (
              <p className="mt-1 text-sm text-muted-foreground">
                Elige una contraseña segura.
              </p>
            )}
          </div>

          {/* Step content */}
          {step === "email" && (
            <EmailVerificationForm
              email={email}
              onEmailSent={(e) => {
                setEmail(e);
                setStep("code");
              }}
            />
          )}

          {step === "code" && (
            <CodeVerificationForm
              email={email}
              onVerified={(t, expiresIso) => {
                setToken(t);
                if (expiresIso) {
                  setExpiresAt(new Date(expiresIso));
                } else {
                  // Fallback: 15 minutes from now
                  setExpiresAt(new Date(Date.now() + 15 * 60 * 1000));
                }
                setTimeLeft(15 * 60);
                setStep("password");
              }}
            />
          )}

          {step === "password" && (
            <PasswordSetupForm
              email={email}
              tempToken={token}
              timeLeft={timeLeft}
              expiresAt={expiresAt!}
              onSuccess={() => setStep("success")}
            />
          )}

          {step === "success" && (
            <div className="space-y-4 text-center">
              <div className="flex justify-center">
                <CheckCircle2 className="h-12 w-12 text-green-500" />
              </div>
              <p className="text-sm text-muted-foreground">
                Tu contraseña ha sido configurada correctamente.
              </p>
              <Button asChild className="w-full">
                <Link to="/login">Ir a iniciar sesión</Link>
              </Button>
            </div>
          )}

          {/* Back button (not on email or success) */}
          {step !== "email" && step !== "success" && (
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => {
                if (step === "code") setStep("email");
                if (step === "password") setStep("code");
              }}
            >
              <ArrowLeft className="h-4 w-4" />
              Volver
            </Button>
          )}
        </div>

        {/* Back to login link */}
        {step === "email" && (
          <p className="mt-4 text-center text-xs text-muted-foreground">
            ¿Ya tienes contraseña?{" "}
            <Link to="/login" className="text-primary hover:underline">
              Iniciar sesión
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
