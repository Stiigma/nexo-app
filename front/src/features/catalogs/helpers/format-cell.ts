/** Formateadores por tipo de campo para celdas de tabla. */

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

export function formatPercent(value: number, fractionDigits = 2): string {
  return `${(value * 100).toFixed(fractionDigits)}%`;
}

export function formatBoolean(value: boolean): string {
  return value ? "Sí" : "No";
}

export function formatOptional(value: string | null | undefined): string {
  return value && value.trim() ? value : "—";
}
