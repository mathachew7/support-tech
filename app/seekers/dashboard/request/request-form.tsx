"use client";

import { useEffect, useMemo, useState, useActionState } from "react";
import { createRequestAction, type RequestState } from "./actions";
import { MultiCombobox } from "@/app/_components/ui/MultiCombobox";
import { SearchSelect } from "@/app/_components/ui/SearchSelect";
import { DatePicker } from "@/app/_components/ui/DatePicker";
import { TimePicker } from "@/app/_components/ui/TimePicker";
import { TIMEZONES, tzLabel } from "@/app/_components/ui/timezones";
import { label12 } from "@/app/_components/ui/datetime";
import { normalizeSkillName, computeEndDate, COMMITMENT_MONTHS } from "@/lib/services/requests-core";
import styles from "./request.module.css";

const initial: RequestState = {};

function detectTz(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}

function monthLabel(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  return Number.isNaN(d.getTime())
    ? ""
    : d.toLocaleDateString(undefined, { month: "short", year: "numeric" });
}

export default function RequestForm({ skills }: { skills: string[] }) {
  const [state, action, pending] = useActionState(createRequestAction, initial);

  const [chosenSkills, setChosenSkills] = useState<string[]>([]);
  const [commitment, setCommitment] = useState<number>(COMMITMENT_MONTHS[0]);
  const [startDate, setStartDate] = useState("");
  const [times, setTimes] = useState<string[]>([""]);
  const [note, setNote] = useState("");

  // Timezone: start from a stable default for SSR, then detect on the client
  // (avoids a hydration mismatch between server and browser timezones).
  const [tz, setTz] = useState("UTC");
  // Client-only: read the browser timezone once after mount (SSR stays "UTC").
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setTz(detectTz()), []);
  const zones = useMemo(() => {
    if (TIMEZONES.some((z) => z.value === tz)) return TIMEZONES;
    return [{ value: tz, label: tz.replace(/_/g, " "), keywords: tz }, ...TIMEZONES];
  }, [tz]);

  const endLabel = useMemo(() => {
    if (!startDate) return null;
    const d = computeEndDate(new Date(startDate + "T00:00:00"), commitment);
    return Number.isNaN(d.getTime())
      ? null
      : d.toLocaleDateString(undefined, { month: "short", year: "numeric" });
  }, [startDate, commitment]);

  const setTimeAt = (i: number, v: string) =>
    setTimes((ts) => ts.map((t, idx) => (idx === i ? v : t)));
  const addTime = () => setTimes((ts) => [...ts, ""]);
  const removeTime = (i: number) =>
    setTimes((ts) => (ts.length === 1 ? ts : ts.filter((_, idx) => idx !== i)));

  const chosenTimes = times.filter(Boolean);

  return (
    <form action={action} className={styles.layout}>
      {/* LEFT: form */}
      <div className="card">
        <div className={styles.form}>
          {/* Skill */}
          <div className={styles.section}>
            <span className={styles.sectionLabel}>
              What do you need help with?
            </span>
            <MultiCombobox
              name="skills"
              values={chosenSkills}
              onChange={setChosenSkills}
              options={skills}
              normalize={normalizeSkillName}
              placeholder="Type a skill, e.g. Kubernetes - add as many as you need"
            />
            <span className={styles.hint}>
              Add one or more skills. Pick a suggestion or type your own - we tidy the capitalisation.
            </span>
          </div>

          {/* Commitment + start date */}
          <div className={styles.grid2}>
            <div className={styles.section}>
              <span className={styles.sectionLabel}>Commitment</span>
              <input type="hidden" name="commitmentMonths" value={commitment} />
              <div className={styles.segment}>
                {COMMITMENT_MONTHS.map((m) => (
                  <button
                    type="button"
                    key={m}
                    onClick={() => setCommitment(m)}
                    className={`${styles.segmentBtn} ${commitment === m ? styles.segmentActive : ""}`}
                  >
                    {m} mo
                  </button>
                ))}
              </div>
            </div>
            <div className={styles.section}>
              <label className={styles.sectionLabel}>Start date</label>
              <DatePicker name="startDate" value={startDate} onChange={setStartDate} />
              <span className={styles.hint}>
                {endLabel ? `Ends around ${endLabel}` : "End date is calculated for you."}
              </span>
            </div>
          </div>

          {/* Timezone */}
          <div className={styles.section}>
            <label className={styles.sectionLabel}>Your timezone</label>
            <SearchSelect name="timezone" value={tz} onChange={setTz} options={zones} />
          </div>

          {/* Preferred times */}
          <div className={styles.section}>
            <span className={styles.sectionLabel}>Preferred times</span>
            <span className={styles.hint}>
              Add a few times that usually work for you.
            </span>
            <div className={styles.times}>
              {times.map((t, i) => (
                <div className={styles.timeRow} key={i}>
                  <TimePicker name="times" value={t} onChange={(v) => setTimeAt(i, v)} />
                  <button
                    type="button"
                    className={styles.removeBtn}
                    onClick={() => removeTime(i)}
                    disabled={times.length === 1}
                    aria-label="Remove time"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            <button type="button" className={styles.addBtn} onClick={addTime}>
              + Add another time
            </button>
          </div>

          {/* Details */}
          <div className={styles.section}>
            <label htmlFor="note" className={styles.sectionLabel}>
              Additional details <span className="muted small">(optional)</span>
            </label>
            <textarea
              id="note"
              name="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. I'm stuck debugging a failing Helm deploy on EKS."
            />
          </div>

          {state.error && <p className="notice notice--error">{state.error}</p>}

          <div className={styles.actions}>
            <button className="btn btn--primary" type="submit" disabled={pending}>
              {pending ? "Submitting…" : "Submit request"}
            </button>
          </div>
        </div>
      </div>

      {/* RIGHT: live summary */}
      <aside className={styles.summary}>
        <div className={styles.summaryTitle}>Request summary</div>

        <div className={styles.sumRow}>
          <span className={styles.sumLabel}>Skills</span>
          {chosenSkills.length ? (
            <span className={styles.sumTimes}>
              {chosenSkills.map((s) => (
                <span key={s} className={styles.sumChip}>{s}</span>
              ))}
            </span>
          ) : (
            <span className={`${styles.sumValue} ${styles.sumValueMuted}`}>Not set</span>
          )}
        </div>
        <div className={styles.sumRow}>
          <span className={styles.sumLabel}>Commitment</span>
          <span className={styles.sumValue}>
            {commitment} months
            {startDate && (
              <span className={styles.sumValueMuted}>
                {" "}
                ({monthLabel(startDate)}
                {endLabel ? ` – ${endLabel}` : ""})
              </span>
            )}
          </span>
        </div>
        <div className={styles.sumRow}>
          <span className={styles.sumLabel}>Timezone</span>
          <span className={styles.sumValue}>{tzLabel(tz)}</span>
        </div>
        <div className={styles.sumRow}>
          <span className={styles.sumLabel}>Times</span>
          {chosenTimes.length ? (
            <span className={styles.sumTimes}>
              {chosenTimes.map((t, i) => (
                <span key={i} className={styles.sumChip}>{label12(t)}</span>
              ))}
            </span>
          ) : (
            <span className={`${styles.sumValue} ${styles.sumValueMuted}`}>None yet</span>
          )}
        </div>
        <div className={styles.sumRow}>
          <span className={styles.sumLabel}>Details</span>
          <span className={`${styles.sumValue} ${note ? "" : styles.sumValueMuted}`}>
            {note ? (note.length > 40 ? note.slice(0, 40) + "…" : note) : "None"}
          </span>
        </div>
      </aside>
    </form>
  );
}
