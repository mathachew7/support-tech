"use client";

import { useRef, useState } from "react";
import { useOutside } from "./use-outside";
import { DOW_SHORT, MONTHS, toISODate as toISO } from "./datetime";
import styles from "./ui.module.css";

/** Custom calendar popover. Value/onChange use "YYYY-MM-DD". Past days disabled. */
export function DatePicker({
  id,
  name,
  value,
  onChange,
  placeholder,
}: {
  id?: string;
  name?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  useOutside(ref, () => setOpen(false), open);

  const selected = value ? new Date(value + "T00:00:00") : null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [view, setView] = useState<Date>(() => selected ?? today);

  const y = view.getFullYear();
  const m = view.getMonth();
  const lead = new Date(y, m, 1).getDay();
  const days = new Date(y, m + 1, 0).getDate();

  return (
    <div className={styles.control} ref={ref}>
      {name && <input type="hidden" name={name} value={value} />}
      <button
        type="button"
        id={id}
        className={`${styles.trigger} ${open ? styles.triggerOpen : ""}`}
        onClick={() => setOpen((o) => !o)}
      >
        <span className={styles.caret}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>
        </span>
        <span className={`${styles.triggerValue} ${selected ? "" : styles.triggerPlaceholder}`}>
          {selected ? selected.toLocaleDateString(undefined, { dateStyle: "medium" }) : placeholder ?? "Pick a date"}
        </span>
      </button>

      {open && (
        <div className={styles.popover}>
          <div className={styles.cal}>
            <div className={styles.calHead}>
              <button type="button" className={styles.calNav} onClick={() => setView(new Date(y, m - 1, 1))} aria-label="Previous month">‹</button>
              <span className={styles.calTitle}>{MONTHS[m]} {y}</span>
              <button type="button" className={styles.calNav} onClick={() => setView(new Date(y, m + 1, 1))} aria-label="Next month">›</button>
            </div>
            <div className={styles.calGrid}>
              {DOW_SHORT.map((d) => (
                <div key={d} className={styles.calDow}>{d}</div>
              ))}
              {Array.from({ length: lead }).map((_, i) => (
                <div key={`e${i}`} className={styles.calEmpty} />
              ))}
              {Array.from({ length: days }).map((_, i) => {
                const day = i + 1;
                const d = new Date(y, m, day);
                d.setHours(0, 0, 0, 0);
                const isPast = d.getTime() < today.getTime();
                const isSel = selected != null && toISO(d) === toISO(selected);
                const isToday = d.getTime() === today.getTime();
                return (
                  <button
                    type="button"
                    key={day}
                    disabled={isPast}
                    className={`${styles.calDay} ${isToday ? styles.calDayToday : ""} ${isSel ? styles.calDaySelected : ""}`}
                    onClick={() => {
                      onChange(toISO(d));
                      setOpen(false);
                    }}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
