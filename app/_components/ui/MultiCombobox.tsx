"use client";

import { useRef, useState } from "react";
import { useOutside } from "./use-outside";
import styles from "./ui.module.css";

/**
 * Multi-select combobox with chips. Free entry allowed (typed text becomes a
 * tag); suggestions help. Each selected value is submitted via a hidden `name`.
 */
export function MultiCombobox({
  name,
  values,
  onChange,
  options,
  placeholder,
  normalize,
}: {
  name?: string;
  values: string[];
  onChange: (v: string[]) => void;
  options: string[];
  placeholder?: string;
  normalize?: (s: string) => string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  useOutside(ref, () => setOpen(false), open);

  const add = (raw: string) => {
    const v = (normalize ? normalize(raw) : raw).trim();
    if (!v) return;
    if (!values.some((x) => x.toLowerCase() === v.toLowerCase())) {
      onChange([...values, v]);
    }
    setQ("");
  };
  const remove = (v: string) => onChange(values.filter((x) => x !== v));

  const nq = q.trim().toLowerCase();
  const filtered = (nq ? options.filter((o) => o.toLowerCase().includes(nq)) : options)
    .filter((o) => !values.some((v) => v.toLowerCase() === o.toLowerCase()))
    .slice(0, 8);
  const exists =
    options.some((o) => o.toLowerCase() === nq) ||
    values.some((v) => v.toLowerCase() === nq);

  return (
    <div className={styles.control} ref={ref}>
      {name && values.map((v) => <input key={v} type="hidden" name={name} value={v} />)}
      <div
        className={`${styles.tagsInput} ${open ? styles.triggerOpen : ""}`}
        onClick={() => {
          setOpen(true);
          inputRef.current?.focus();
        }}
      >
        {values.map((v) => (
          <span key={v} className={styles.tag}>
            {v}
            <button
              type="button"
              className={styles.tagX}
              onClick={(e) => {
                e.stopPropagation();
                remove(v);
              }}
              aria-label={`Remove ${v}`}
            >
              ×
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          className={styles.tagField}
          value={q}
          placeholder={values.length ? "Add another…" : placeholder}
          autoComplete="off"
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              if (q.trim()) add(q);
            } else if (e.key === "Backspace" && !q && values.length) {
              remove(values[values.length - 1]);
            }
          }}
        />
      </div>
      {open && (filtered.length > 0 || (q.trim() && !exists)) && (
        <div className={styles.popover}>
          <div className={styles.list}>
            {filtered.map((o) => (
              <button type="button" key={o} className={styles.option} onClick={() => add(o)}>
                {o}
              </button>
            ))}
            {q.trim() && !exists && (
              <button
                type="button"
                className={`${styles.option} ${styles.addCustom}`}
                onClick={() => add(q)}
              >
                Add &ldquo;{(normalize ? normalize(q) : q).trim()}&rdquo;
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
