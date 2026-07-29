// Shared date/time constants + helpers for dashboard UI (calendar, time picker,
// summaries). Reusable across dashboards.

export const DOW_SHORT = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"] as const;
export const DOW_LONG = [
  "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday",
] as const;

export const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
] as const;
export const MONTHS_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
] as const;

/** Time-of-day options in 30-minute increments, "HH:MM" (24h). */
export const TIME_SLOTS: string[] = (() => {
  const out: string[] = [];
  for (let h = 0; h < 24; h++) {
    for (const mm of [0, 30]) {
      out.push(`${String(h).padStart(2, "0")}:${String(mm).padStart(2, "0")}`);
    }
  }
  return out;
})();

/** "18:30" -> "6:30 PM". */
export function label12(hhmm: string): string {
  const [h, m] = hhmm.split(":").map(Number);
  const ap = h < 12 ? "AM" : "PM";
  const h12 = ((h + 11) % 12) + 1;
  return `${h12}:${String(m).padStart(2, "0")} ${ap}`;
}

/** Local "YYYY-MM-DD" for a Date (no timezone shift). */
export function toISODate(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}
