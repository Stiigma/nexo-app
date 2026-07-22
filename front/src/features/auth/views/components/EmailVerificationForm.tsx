import { useState } from "react";
import { Loader2, Mail, ArrowRight } from "lucide-react";
import { Input } from "@/common/components/ui/input";
import { Label } from "@/common/components/ui/label";
import { Button } from "@/common/components/ui/button";
import { useSendCode } from "../../hooks/use-set-password";

interface EmailVerificationFormProps {
  email: string;
  onEmailSent: (email: string) => void;
}

export function EmailVerificationForm({
  email: initialEmail,
  onEmailSent,
}: EmailVerificationFormProps) {
  const [email, setEmail] = useState(initialEmail);
  const sendCodeMutation = useSendCode();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    sendCodeMutation.reset();

    try {
      await sendCodeMutation.mutateAsync(email);
      onEmailSent(email);
    } catch {
      // Error displayed below
    }
  }

  const isLoading = sendCodeMutation.isPending;
  const error = sendCodeMutation.error as Error | null;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="sp-email">Correo electrónico</Label>
        <Input
          id="sp-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="usuario@nexo.com"
          required
          autoComplete="email"
          disabled={isLoading}
        />
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          {error.message}
        </div>
      )}

      <Button type="submit" className="w-full" disabled={isLoading || !email}>
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Mail className="h-4 w-4" />
        )}
        {isLoading ? "Enviando código..." : "Enviar código"}
      </Button>
    </form>
  );
}
