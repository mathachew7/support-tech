import { describe, it, expect } from "vitest";
import { validateWindow, validateWeeklyAvailability } from "./availability";

// A single availability window is minutes-from-midnight; end must be after start
// and both within the day (0..1440, where 1440 = end of day / midnight).
describe("validateWindow", () => {
  it("accepts a normal 09:00-17:00 window", () => {
    expect(validateWindow({ day: "mon", startMin: 540, endMin: 1020 }).ok).toBe(true);
  });

  it("accepts a window ending at midnight (1440)", () => {
    expect(validateWindow({ day: "fri", startMin: 1200, endMin: 1440 }).ok).toBe(true);
  });

  it("rejects end <= start", () => {
    expect(validateWindow({ day: "mon", startMin: 600, endMin: 600 }).ok).toBe(false);
    expect(validateWindow({ day: "mon", startMin: 600, endMin: 540 }).ok).toBe(false);
  });

  it("rejects out-of-range minutes", () => {
    expect(validateWindow({ day: "mon", startMin: -1, endMin: 600 }).ok).toBe(false);
    expect(validateWindow({ day: "mon", startMin: 60, endMin: 1441 }).ok).toBe(false);
  });

  it("rejects an invalid day", () => {
    expect(validateWindow({ day: "funday", startMin: 540, endMin: 600 }).ok).toBe(false);
  });
});

// The whole weekly grid a provider submits: every window valid, and no two
// windows on the same day overlap (a double-booked availability is a bug).
describe("validateWeeklyAvailability", () => {
  it("accepts non-overlapping windows across days", () => {
    const r = validateWeeklyAvailability([
      { day: "mon", startMin: 540, endMin: 720 },
      { day: "mon", startMin: 780, endMin: 1020 },
      { day: "wed", startMin: 540, endMin: 720 },
    ]);
    expect(r.ok).toBe(true);
  });

  it("rejects overlapping windows on the same day", () => {
    const r = validateWeeklyAvailability([
      { day: "mon", startMin: 540, endMin: 720 },
      { day: "mon", startMin: 600, endMin: 800 },
    ]);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toMatch(/overlap/i);
  });

  it("allows the same time on different days", () => {
    const r = validateWeeklyAvailability([
      { day: "mon", startMin: 540, endMin: 720 },
      { day: "tue", startMin: 540, endMin: 720 },
    ]);
    expect(r.ok).toBe(true);
  });

  it("accepts an empty schedule", () => {
    expect(validateWeeklyAvailability([]).ok).toBe(true);
  });
});
