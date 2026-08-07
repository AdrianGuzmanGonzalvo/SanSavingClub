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
