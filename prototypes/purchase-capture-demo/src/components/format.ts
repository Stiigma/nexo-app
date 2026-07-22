export function formatDate(dateInput: string): string {
  const [year, month, day] = dateInput.split("-");
  return `${day}/${month}/${year}`;
}

export function formatPercent(value: number): string {
  return `${value.toFixed(value % 1 === 0 ? 0 : 2)}%`;
}

export function formatRate(value: number | null): string {
  if (value === null) {
    return "No aplica";
  }

  return value.toFixed(2);
}

export function formatMoney(value: number, currency: string): string {
  return `${currency} ${value.toFixed(2)}`;
}
