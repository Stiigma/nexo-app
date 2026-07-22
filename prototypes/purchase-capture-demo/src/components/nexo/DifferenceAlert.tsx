import { AlertTriangle } from "lucide-react";
import type { ReactNode } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

type DifferenceAlertProps = {
  title?: string;
  children?: ReactNode;
};

/**
 * `DifferenceAlert` es un `Alert` warning sólido que aparece sólo si hay
 * diferencia entre el total pagado y el esperado. No translúcido.
 */
export function DifferenceAlert({
  title = "El total pagado difiere del esperado",
  children,
}: DifferenceAlertProps) {
  return (
    <Alert variant="warning">
      <AlertTriangle aria-hidden="true" />
      <AlertTitle>{title}</AlertTitle>
      {children ? <AlertDescription>{children}</AlertDescription> : null}
    </Alert>
  );
}
