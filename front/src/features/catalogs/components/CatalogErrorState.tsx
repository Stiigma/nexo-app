import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/common/components/ui/button";
import { ApiError } from "@/common/types/api";

interface CatalogErrorStateProps {
  label: string;
  error: unknown;
  onRetry: () => void;
}

export function CatalogErrorState({ label, error, onRetry }: CatalogErrorStateProps) {
  const message =
    error instanceof ApiError
      ? error.message
      : error instanceof Error
        ? error.message
        : "Error desconocido";

  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <AlertCircle className="h-7 w-7" />
      </div>
      <div className="space-y-1">
        <p className="text-base font-semibold text-foreground">
          No se pudieron cargar {label.toLowerCase()}.
        </p>
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
      <Button variant="outline" size="sm" onClick={onRetry}>
        <RefreshCw className="h-4 w-4" />
        Reintentar
      </Button>
    </div>
  );
}
