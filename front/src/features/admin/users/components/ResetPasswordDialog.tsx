import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/common/components/ui/dialog";
import { Button } from "@/common/components/ui/button";
import { Input } from "@/common/components/ui/input";
import { Label } from "@/common/components/ui/label";
import { ApiError } from "@/common/types/api";
import { useResetPassword } from "../hooks";

interface ResetPasswordDialogProps {
  userId: string;
  userEmail: string;
  open: boolean;
  onClose: () => void;
}

export function ResetPasswordDialog({ userId, userEmail, open, onClose }: ResetPasswordDialogProps) {
  const resetMutation = useResetPassword();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Mínimo 8 caracteres");
      return;
    }
    if (password !== confirm) {
      setError("Las contraseñas no coinciden");
      return;
    }

    try {
      await resetMutation.mutateAsync({ id: userId, newPassword: password });
      toast.success(`Contraseña actualizada para ${userEmail}`);
      setPassword("");
      setConfirm("");
      onClose();
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Error desconocido";
      setError(message);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(next) => { if (!next) onClose(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Restablecer contraseña</DialogTitle>
          <DialogDescription>
            Nueva contraseña para <strong>{userEmail}</strong>. El usuario deberá usar esta nueva contraseña en su próximo inicio de sesión.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reset-password">Nueva contraseña</Label>
            <Input
              id="reset-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={resetMutation.isPending}
              placeholder="Mínimo 8 caracteres"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="reset-confirm">Confirmar contraseña</Label>
            <Input
              id="reset-confirm"
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              disabled={resetMutation.isPending}
              placeholder="Repite la contraseña"
            />
          </div>
          {error && <p className="text-xs text-destructive">{error}</p>}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={resetMutation.isPending}>
              Cancelar
            </Button>
            <Button type="submit" disabled={resetMutation.isPending}>
              {resetMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {resetMutation.isPending ? "Actualizando..." : "Actualizar contraseña"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
