// Weekly availability validation. Pure so provider profile submission can be
// checked before touching the DB, and the rules are unit-testable.

export const DAYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;
export type Day = (typeof DAYS)[number];

export type Window = { day: string; startMin: number; endMin: number };

export type Valid = { ok: true } | { ok: false; error: string };

const DAY_START = 0;
const DAY_END = 1440; // minutes; 1440 = midnight / end of day

/** Validate a single availability window in isolation. */
export function validateWindow(w: Window): Valid {
  if (!DAYS.includes(w.day as Day)) {
    return { ok: false, error: `Invalid day: ${w.day}` };
  }
  if (!Number.isInteger(w.startMin) || !Number.isInteger(w.endMin)) {
    return { ok: false, error: "Times must be whole minutes" };
  }
  if (w.startMin < DAY_START || w.endMin > DAY_END) {
    return { ok: false, error: "Times must be within the day (00:00-24:00)" };
  }
  if (w.endMin <= w.startMin) {
    return { ok: false, error: "End time must be after start time" };
  }
  return { ok: true };
}

/**
 * Validate a full weekly schedule: every window valid, and no two windows on
 * the same day overlap. Touching windows (one ends exactly when the next
 * starts) are allowed.
 */
export function validateWeeklyAvailability(windows: Window[]): Valid {
  for (const w of windows) {
    const single = validateWindow(w);
    if (!single.ok) return single;
  }

  const byDay = new Map<string, Window[]>();
  for (const w of windows) {
    const list = byDay.get(w.day) ?? [];
    list.push(w);
    byDay.set(w.day, list);
  }

  for (const list of byDay.values()) {
    const sorted = [...list].sort((a, b) => a.startMin - b.startMin);
    for (let i = 1; i < sorted.length; i++) {
      if (sorted[i].startMin < sorted[i - 1].endMin) {
        return { ok: false, error: "Availability windows on the same day overlap" };
      }
    }
  }

  return { ok: true };
}
