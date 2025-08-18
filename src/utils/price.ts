
export function formatPrice(
  amountCents: number | null | undefined,
  currency: string = "USD",
  locale: string = "en-US"
): string {
  if (amountCents == null) return "N/A";
  const amount = amountCents / 100;
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}
