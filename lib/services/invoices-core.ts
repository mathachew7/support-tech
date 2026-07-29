// Pure invoice rules: money math, number formatting, validation, and the
// mark-paid transition. Framework-free so they are fast to unit test.

export type InvoiceStatus = "pending" | "paid" | "void";

export type Valid = { ok: true } | { ok: false; error: string };

const MAX_AMOUNT_CENTS = 100_000_00; // $100,000 sanity cap

/** Money in integer cents -> localized currency string. */
export function formatMoney(amountCents: number, currency = "USD"): string {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
  }).format(amountCents / 100);
}

/** Sequence number -> "INV-00001". */
export function formatInvoiceNumber(seq: number): string {
  return `INV-${String(seq).padStart(5, "0")}`;
}

/** Parse a dollar string ("49.99", "$1,200") to integer cents; null if invalid. */
export function dollarsToCents(input: string): number | null {
  const cleaned = String(input).replace(/[^0-9.]/g, "");
  if (!/[0-9]/.test(cleaned)) return null; // no digits -> invalid
  const n = Number(cleaned);
  if (!Number.isFinite(n) || n < 0) return null;
  return Math.round(n * 100);
}

export type InvoiceDraft = {
  seekerId: string;
  amountCents: number;
  description?: string | null;
};

export function validateInvoiceDraft(d: InvoiceDraft): Valid {
  if (!d.seekerId) return { ok: false, error: "Choose a seeker" };
  if (!Number.isInteger(d.amountCents) || d.amountCents <= 0) {
    return { ok: false, error: "Amount must be greater than zero" };
  }
  if (d.amountCents > MAX_AMOUNT_CENTS) {
    return { ok: false, error: "Amount is too large" };
  }
  return { ok: true };
}

/** Only a pending invoice can be marked paid. */
export function canMarkPaid(status: InvoiceStatus): Valid {
  if (status === "paid") return { ok: false, error: "Invoice is already paid" };
  if (status === "void") return { ok: false, error: "Cannot pay a voided invoice" };
  return { ok: true };
}
