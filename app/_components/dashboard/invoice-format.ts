// Plain helpers usable from both server and client components (no "use client").

export function planLabel(r: { planName: string | null; description: string | null }): string {
  return r.planName || r.description || "Invoice";
}

export function periodText(r: {
  periodLabel: string | null;
  periodIndex: number | null;
  periodTotal: number | null;
}): string {
  const inst =
    r.periodIndex && r.periodTotal ? `Invoice ${r.periodIndex} of ${r.periodTotal}` : "";
  return [r.periodLabel, inst].filter(Boolean).join(" · ") || "-";
}

/** Non-empty address lines: street, "City, State ZIP", country. */
export function addressLines(a: {
  street?: string | null;
  city?: string | null;
  state?: string | null;
  zip?: string | null;
  country?: string | null;
}): string[] {
  const cityLine = [a.city, [a.state, a.zip].filter(Boolean).join(" ")]
    .filter(Boolean)
    .join(", ");
  return [a.street, cityLine, a.country]
    .map((s) => (s ?? "").trim())
    .filter(Boolean);
}
