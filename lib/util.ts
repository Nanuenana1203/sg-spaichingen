export function centsToEuro(cents: number | null | undefined) {
  const v = (cents ?? 0) / 100;
  return v.toLocaleString("de-DE", { style: "currency", currency: "EUR" });
}
export function startOfMonth(d = new Date()) {
  return new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0);
}
