// Booking status -> a labelled, colour-coded badge. Shared by every view that
// lists sessions so the wording and colours stay consistent.

const STATUS: Record<string, { label: string; cls: string }> = {
  // Booking statuses
  requested: { label: "Awaiting match", cls: "badge--pending" },
  scheduled: { label: "Scheduled", cls: "badge--approved" },
  completed: { label: "Completed", cls: "badge--muted" },
  no_show: { label: "No-show", cls: "badge--suspended" },
  cancelled: { label: "Cancelled", cls: "badge--muted" },
  // Request statuses (some overlap with bookings)
  matched: { label: "Matched", cls: "badge--approved" },
  closed: { label: "Closed", cls: "badge--muted" },
};

export function StatusBadge({ status }: { status: string }) {
  const s = STATUS[status] ?? { label: status, cls: "badge--muted" };
  return <span className={`badge ${s.cls}`}>{s.label}</span>;
}
