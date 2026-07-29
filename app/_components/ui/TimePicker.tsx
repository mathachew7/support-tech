"use client";

import { useRef, useState } from "react";
import { useOutside } from "./use-outside";
import { TIME_SLOTS, label12 } from "./datetime";
import styles from "./ui.module.css";

/** Time-of-day picker. Value/onChange use "HH:MM" (24h). Submits via hidden `name`. */
export function TimePicker({
  name,
  value,
  onChange,
}: {
  name?: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  useOutside(ref, () => setOpen(false), open);

  return (
    <div className={styles.control} ref={ref}>
      {name && <input type="hidden" name={name} value={value} />}
      <button
        type="button"
        className={`${styles.trigger} ${open ? styles.triggerOpen : ""}`}
        onClick={() => setOpen((o) => !o)}
      >
        <span className={styles.caret}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
        </span>
        <span className={`${styles.triggerValue} ${value ? "" : styles.triggerPlaceholder}`}>
          {value ? label12(value) : "Pick a time"}
        </span>
      </button>
      {open && (
        <div className={styles.popover}>
          <div className={styles.list}>
            {TIME_SLOTS.map((t) => (
              <button
                type="button"
                key={t}
                className={`${styles.option} ${t === value ? styles.optionActive : ""}`}
                onClick={() => {
                  onChange(t);
                  setOpen(false);
                }}
              >
                {label12(t)}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
