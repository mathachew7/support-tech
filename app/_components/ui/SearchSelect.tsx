"use client";

import { useRef, useState } from "react";
import { useOutside } from "./use-outside";
import styles from "./ui.module.css";

export type SelectOption = { value: string; label: string; keywords?: string };

/** Searchable, pick-from-list dropdown (no free text). Submits via hidden `name`. */
export function SearchSelect({
  id,
  name,
  value,
  onChange,
  options,
  placeholder,
}: {
  id?: string;
  name?: string;
  value: string;
  onChange: (v: string) => void;
  options: SelectOption[];
  placeholder?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  useOutside(ref, () => setOpen(false), open);

  const selected = options.find((o) => o.value === value);
  const nq = q.trim().toLowerCase();
  const filtered = (
    nq
      ? options.filter((o) =>
          `${o.label} ${o.keywords ?? ""} ${o.value}`.toLowerCase().includes(nq),
        )
      : options
  ).slice(0, 80);

  return (
    <div className={styles.control} ref={ref}>
      {name && <input type="hidden" name={name} value={value} />}
      <button
        type="button"
        id={id}
        className={`${styles.trigger} ${open ? styles.triggerOpen : ""}`}
        onClick={() => setOpen((o) => !o)}
      >
        <span className={`${styles.triggerValue} ${selected ? "" : styles.triggerPlaceholder}`}>
          {selected ? selected.label : placeholder ?? "Select…"}
        </span>
        <span className={styles.caret}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
        </span>
      </button>
      {open && (
        <div className={styles.popover}>
          <div className={styles.search}>
            <span className={styles.searchIcon}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg>
            </span>
            <input
              autoFocus
              placeholder="Search zone or abbreviation (CST, PST…)"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <div className={styles.list}>
            {filtered.length === 0 && <div className={styles.empty}>No matches</div>}
            {filtered.map((o) => (
              <button
                type="button"
                key={o.value}
                className={`${styles.option} ${o.value === value ? styles.optionActive : ""}`}
                onClick={() => {
                  onChange(o.value);
                  setOpen(false);
                  setQ("");
                }}
              >
                <span>{o.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
