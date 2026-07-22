import { Toaster as Sonner, type ToasterProps } from "sonner";

/**
 * Toaster Nexo (sonner). Default en modo claro (canvas Nexo).
 * Los toasts usan superficies sólidas con tokens de la marca.
 */
function Toaster({ ...props }: ToasterProps) {
  return (
    <Sonner
      theme="light"
      position="bottom-right"
      richColors={false}
      closeButton
      duration={4000}
      toastOptions={{
        classNames: {
          toast:
            "group rounded-lg border border-border bg-card text-card-foreground shadow-lg",
          title: "text-sm font-semibold",
          description: "text-sm text-muted-foreground",
          actionButton:
            "bg-brand text-primary-foreground rounded-md text-sm font-medium hover:bg-brand-strong",
          cancelButton:
            "bg-surface-2 text-foreground rounded-md text-sm font-medium hover:bg-surface-2/80",
          success: "border-success/25 bg-success-soft text-success-ink",
          error: "border-danger/25 bg-danger-soft text-danger-ink",
          warning: "border-warning/25 bg-warning-soft text-warning-ink",
          info: "border-brand/20 bg-brand-soft text-info-ink",
        },
      }}
      {...props}
    />
  );
}

export { Toaster };
