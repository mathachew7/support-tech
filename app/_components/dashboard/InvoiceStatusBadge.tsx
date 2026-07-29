const STATUS: Record<string, { label: string; cls: string }> = {
  pending: { label: "Pending", cls: "badge--pending" },
  paid: { label: "Paid", cls: "badge--approved" },
  void: { label: "Void", cls: "badge--muted" },
};

export function InvoiceStatusBadge({ status }: { status: string }) {
  const s = STATUS[status] ?? { label: status, cls: "badge--muted" };
  return <span className={`badge ${s.cls}`}>{s.label}</span>;
}
