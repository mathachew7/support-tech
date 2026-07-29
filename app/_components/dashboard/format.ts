// Small shared formatters for dashboard views.

/** "Aug 3, 2026, 10:00 AM" in the viewer's locale. */
export function whenLabel(d: Date): string {
  return d.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}
