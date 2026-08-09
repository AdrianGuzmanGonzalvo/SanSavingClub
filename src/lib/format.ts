export function formatUSD(amount: number | string | { toString(): string }): string {
  const value = typeof amount === "number" ? amount : parseFloat(amount.toString());
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

export function formatDate(date: Date | string, locale: "en" | "es" = "en"): string {
  const value = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale === "es" ? "es-ES" : "en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(value);
}

/** Fixed mm/dd/yyyy format, regardless of locale. */
export function formatDateMDY(date: Date | string): string {
  const value = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
  }).format(value);
}
