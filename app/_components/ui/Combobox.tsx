"use client";

import { useRef, useState } from "react";
import { useOutside } from "./use-outside";
import styles from "./ui.module.css";

/**
 * Free-text input with suggestions. The typed text IS the value (free entry
 * allowed); suggestions just help. Submits `value` via a hidden `name` input.
 */
export function Combobox({
  id,
  name,
  value,
  onChange,
  options,
  placeholder,
  onCommit,
}: {
  id?: string;
  name?: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder?: string;
  onCommit?: () => void; // e.g. tidy casing on close
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const close = () => {
    setOpen(false);
    onCommit?.();
  };
  useOutside(ref, close, open);

  const q = value.trim().toLowerCase();
  const filtered = (q ? options.filter((o) => o.toLowerCase().includes(q)) : options).slice(0, 8);
  const exact = options.some((o) => o.toLowerCase() === q);

  return (
    <div className={styles.control} ref={ref}>
      {name && <input type="hidden" name={name} value={value} />}
      <input
        id={id}
        value={value}
        placeholder={placeholder}
        autoComplete="off"
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
      />
      {open && (filtered.length > 0 || (value.trim() && !exact)) && (
        <div className={styles.popover}>
          <div className={styles.list}>
            {filtered.map((o) => (
              <button
                type="button"
                key={o}
                className={styles.option}
                onClick={() => {
                  onChange(o);
                  setOpen(false);
                }}
              >
                {o}
              </button>
            ))}
            {value.trim() && !exact && (
              <button
                type="button"
                className={`${styles.option} ${styles.addCustom}`}
                onClick={close}
              >
                Use &ldquo;{value.trim()}&rdquo;
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
