"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { saveProviderAvailabilityAction, type ProfileState } from "../actions";

export type InitialAvailability = { day: string; start: string; end: string };

const DAY_ORDER: { key: string; label: string }[] = [
  { key: "mon", label: "Monday" },
  { key: "tue", label: "Tuesday" },
  { key: "wed", label: "Wednesday" },
  { key: "thu", label: "Thursday" },
  { key: "fri", label: "Friday" },
  { key: "sat", label: "Saturday" },
  { key: "sun", label: "Sunday" },
];
const initial: ProfileState = {};

type Slot = { id: number; day: string; start: string; end: string };

export function ProviderAvailabilityForm({
  initialAvailability,
}: {
  initialAvailability: InitialAvailability[];
}) {
  const [state, action, pending] = useActionState(saveProviderAvailabilityAction, initial);

  const [showSaved, setShowSaved] = useState(false);
  useEffect(() => {
    if (!state.ok) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setShowSaved(true);
    const t = setTimeout(() => setShowSaved(false), 2000);
    return () => clearTimeout(t);
  }, [state]);

  const idRef = useRef(initialAvailability.length);
  const [slots, setSlots] = useState<Slot[]>(() =>
    initialAvailability.map((a, i) => ({ id: i, day: a.day, start: a.start, end: a.end })),
  );

  const addSlot = (day: string) =>
    setSlots((s) => [...s, { id: idRef.current++, day, start: "09:00", end: "17:00" }]);
  const removeSlot = (id: number) => setSlots((s) => s.filter((x) => x.id !== id));
  const setField = (id: number, field: "start" | "end", value: string) =>
    setSlots((s) => s.map((x) => (x.id === id ? { ...x, [field]: value } : x)));

  return (
    <form action={action} className="stack" style={{ gap: "1.25rem" }}>
      {showSaved && <p className="notice notice--success">Availability saved.</p>}
      {state.error && <p className="notice notice--error">{state.error}</p>}

      <p className="muted small" style={{ margin: 0 }}>
        Add one or more time windows per day. Leave a day empty if you&apos;re not available.
      </p>

      <div className="stack" style={{ gap: "0.9rem" }}>
        {DAY_ORDER.map(({ key, label }) => {
          const daySlots = slots.filter((s) => s.day === key);
          return (
            <div key={key} className="row" style={{ alignItems: "flex-start", gap: "1rem" }}>
              <div style={{ minWidth: 100, fontWeight: 600, paddingTop: "0.45rem" }}>{label}</div>
              <div className="stack" style={{ gap: "0.4rem", flex: 1 }}>
                {daySlots.length === 0 && (
                  <span className="muted small" style={{ paddingTop: "0.45rem" }}>Unavailable</span>
                )}
                {daySlots.map((s) => (
                  <div key={s.id} className="row" style={{ gap: "0.5rem" }}>
                    <input type="hidden" name="day" value={key} />
                    <input
                      type="time"
                      name="start"
                      value={s.start}
                      onChange={(e) => setField(s.id, "start", e.target.value)}
                      style={{ width: "auto" }}
                      aria-label={`${label} start time`}
                    />
                    <span className="muted">to</span>
                    <input
                      type="time"
                      name="end"
                      value={s.end}
                      onChange={(e) => setField(s.id, "end", e.target.value)}
                      style={{ width: "auto" }}
                      aria-label={`${label} end time`}
                    />
                    <button
                      type="button"
                      className="btn btn--small"
                      onClick={() => removeSlot(s.id)}
                      aria-label={`Remove ${label} slot`}
                    >
                      ×
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  className="btn btn--small"
                  onClick={() => addSlot(key)}
                  style={{ alignSelf: "flex-start" }}
                >
                  + Add time
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <button className="btn btn--primary" type="submit" disabled={pending} style={{ alignSelf: "flex-start" }}>
        {pending ? "Saving…" : "Save availability"}
      </button>
    </form>
  );
}
