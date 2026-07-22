import { useState, useEffect } from "react";
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
import { useCreateUser, useUpdateUser } from "../hooks";
import type { UserDto, CreateUserPayload } from "../types";

const ROLE_OPTIONS = [
  { value: "Operator" as const, label: "Operator" },
  { value: "Admin" as const, label: "Admin" },
];

interface UserFormDialogProps {
  user: UserDto | null;  // null = create, non-null = edit
  open: boolean;
  onClose: () => void;
}

export function UserFormDialog({ user, open, onClose }: UserFormDialogProps) {
  const isEditing = user !== null;
  const createMutation = useCreateUser();
  const updateMutation = useUpdateUser();
  const isSaving = createMutation.isPending || updateMutation.isPending;

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<"Admin" | "Operator">("Operator");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      if (user) {
        setEmail(user.email);
        setName(user.name ?? "");
        setRole(user.role as "Admin" | "Operator");
        setPassword("");
      } else {
        setEmail("");
        setName("");
        setRole("Operator");
        setPassword("");
      }
      setErrors({});
    }
  }, [user, open]);

  function validate(): boolean {
    const next: Record<string, string> = {};
    if (!email.trim()) next.email = "El email es obligatorio";
    if (!isEditing && !password) next.password = "La contraseña es obligatoria";
    if (!isEditing && password.length < 8) next.password = "Mínimo 8 caracteres";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!validate()) return;

    try {
      if (isEditing && user) {
        await updateMutation.mutateAsync({
          id: user.id,
          data: {
            email: email.trim(),
            name: name.trim() || null,
            role,
          },
        });
        toast.success("Usuario actualizado");
      } else {
        const payload: CreateUserPayload = {
          email: email.trim(),
          name: name.trim() || undefined,
          password,
          role,
        };
        await createMutation.mutateAsync(payload);
        toast.success("Usuario creado");
      }
      onClose();
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "Error desconocido";
      toast.error(`No se pudo ${isEditing ? "actualizar" : "crear"} el usuario: ${message}`);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(next) => { if (!next && !isSaving) onClose(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar usuario" : "Nuevo usuario"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Actualiza los datos del usuario." : "Crea un nuevo usuario del sistema."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="user-email">Email</Label>
            <Input
              id="user-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSaving}
              placeholder="usuario@nexo.com"
              aria-invalid={Boolean(errors.email)}
            />
            {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="user-name">Nombre</Label>
            <Input
              id="user-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isSaving}
              placeholder="Ej. Ana López"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="user-role">Rol</Label>
            <select
              id="user-role"
              className="flex h-9 w-full rounded-md border border-input bg-card px-3 py-1 text-sm shadow-sm"
              value={role}
              onChange={(e) => setRole(e.target.value as "Admin" | "Operator")}
              disabled={isSaving}
            >
              {ROLE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="user-password">
              {isEditing ? "Nueva contraseña (dejar vacío para no cambiar)" : "Contraseña"}
            </Label>
            <Input
              id="user-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isSaving}
              placeholder={isEditing ? "••••••••" : "Mínimo 8 caracteres"}
              aria-invalid={Boolean(errors.password)}
            />
            {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSaving ? "Guardando..." : (isEditing ? "Guardar cambios" : "Crear usuario")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
