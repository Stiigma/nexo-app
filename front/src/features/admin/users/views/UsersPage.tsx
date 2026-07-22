import { useState } from "react";
import { Plus, Pencil, KeyRound, ToggleLeft, ToggleRight, Loader2, Mail, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/common/components/ui/button";
import { useUsers, useDeactivateUser, useReactivateUser, useSendPasswordSetup } from "../hooks";
import { UserFormDialog } from "../components/UserFormDialog";
import { ResetPasswordDialog } from "../components/ResetPasswordDialog";
import type { UserDto } from "../types";

export function UsersPage() {
  const { data: users, isLoading, error } = useUsers();
  const deactivateMutation = useDeactivateUser();
  const reactivateMutation = useReactivateUser();
  const sendPasswordSetupMutation = useSendPasswordSetup();

  const [formOpen, setFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserDto | null>(null);
  const [resetPw, setResetPw] = useState<{ id: string; email: string } | null>(null);

  function openCreate() {
    setEditingUser(null);
    setFormOpen(true);
  }

  function openEdit(user: UserDto) {
    setEditingUser(user);
    setFormOpen(true);
  }

  async function toggleActive(user: UserDto) {
    try {
      if (user.isActive) {
        await deactivateMutation.mutateAsync(user.id);
        toast.success(`Usuario ${user.email} desactivado`);
      } else {
        await reactivateMutation.mutateAsync(user.id);
        toast.success(`Usuario ${user.email} reactivado`);
      }
    } catch (err) {
      toast.error("Error al cambiar estado");
    }
  }

  async function sendPasswordSetup(user: UserDto) {
    try {
      await sendPasswordSetupMutation.mutateAsync(user.id);
      toast.success(`Correo de configuración enviado a ${user.email}`);
    } catch (err: any) {
      const message = err?.response?.message ?? "Error al enviar correo";
      toast.error(message);
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
        Error al cargar usuarios
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Usuarios</h2>
          <p className="text-sm text-muted-foreground">
            {users?.length ?? 0} usuario{(users?.length ?? 0) !== 1 ? "s" : ""} registrado{(users?.length ?? 0) !== 1 ? "s" : ""}
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo usuario
        </Button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Email</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Nombre</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Rol</th>
              <th className="px-4 py-3 text-center font-medium text-muted-foreground">Estado</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Último acceso</th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users?.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-sm text-muted-foreground">
                  No hay usuarios registrados. Crea el primero.
                </td>
              </tr>
            ) : (
              users?.map((user) => (
                <tr key={user.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-3">{user.email}</td>
                  <td className="px-4 py-3 text-muted-foreground">{user.name ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                      user.role === "Admin"
                        ? "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-200"
                        : "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200"
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center gap-1.5 text-xs ${
                      user.isActive ? "text-green-600" : "text-muted-foreground"
                    }`}>
                      <span className={`h-2 w-2 rounded-full ${user.isActive ? "bg-green-500" : "bg-muted-foreground/40"}`} />
                      {user.isActive ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {!user.hasPassword && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800 dark:bg-yellow-950 dark:text-yellow-200">
                        <AlertTriangle className="h-3 w-3" />
                        Sin contraseña
                      </span>
                    )}
                    {user.lastLoginAt
                      ? new Date(user.lastLoginAt).toLocaleDateString("es-MX", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "Nunca"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex items-center gap-1">
                      {!user.hasPassword && (
                        <button
                          type="button"
                          onClick={() => sendPasswordSetup(user)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                          title="Enviar configuración de contraseña"
                        >
                          <Mail className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => openEdit(user)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                        title="Editar usuario"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setResetPw({ id: user.id, email: user.email })}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                        title="Restablecer contraseña"
                      >
                        <KeyRound className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleActive(user)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                        title={user.isActive ? "Desactivar usuario" : "Reactivar usuario"}
                      >
                        {user.isActive ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <UserFormDialog
        user={editingUser}
        open={formOpen}
        onClose={() => setFormOpen(false)}
      />

      {resetPw && (
        <ResetPasswordDialog
          userId={resetPw.id}
          userEmail={resetPw.email}
          open={true}
          onClose={() => setResetPw(null)}
        />
      )}
    </div>
  );
}
