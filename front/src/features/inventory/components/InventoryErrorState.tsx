import { RefreshCw, AlertTriangle } from "lucide-react";
import { Button } from "@/common/components/ui/button";

interface InventoryErrorStateProps {
  message?: string;
  onRetry: () => void;
}

export function InventoryErrorState({
  message,
  onRetry,
}: InventoryErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <AlertTriangle size={64} className="mb-4 text-amber-500" />
      <h3 className="mb-2 text-xl font-semibold text-foreground">
        No pudimos cargar el inventario
      </h3>
      <p className="mb-6 max-w-sm text-sm text-muted-foreground">
        {message ?? "Error de conexión. Verifica tu red e inténtalo de nuevo."}
      </p>
      <Button onClick={onRetry} variant="outline">
        <RefreshCw size={16} className="mr-2" />
        Reintentar
      </Button>
    </div>
  );
}
