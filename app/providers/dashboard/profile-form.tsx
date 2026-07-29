"use client";

import { useActionState, useState } from "react";
import { saveProviderProfileAction, type ProfileState } from "./actions";

export type CatalogSkill = { id: string; name: string; category: string };

// UI day order (Mon-first reads more naturally than the enum's Sun-first).
const DAY_ORDER: { key: string; label: string }[] = [
  { key: "mon", label: "Monday" },
  { key: "tue", label: "Tuesday" },
  { key: "wed", label: "Wednesday" },
  { key: "thu", label: "Thursday" },
  { key: "fri", label: "Friday" },
  { key: "sat", label: "Saturday" },
  { key: "sun", label: "Sunday" },
];

const PROFICIENCIES = ["beginner", "intermediate", "advanced", "expert"] as const;

export type InitialSkill = { skillId: string; proficiency: string };
export type InitialAvailability = { day: string; start: string; end: string };

const initial: ProfileState = {};

export default function ProviderProfileForm({
  base,
  catalog,
  initialSkills,
  initialAvailability,
}: {
  base: { headline: string; bio: string; location: string };
  catalog: CatalogSkill[];
  initialSkills: InitialSkill[];
  initialAvailability: InitialAvailability[];
}) {
  const [state, action, pending] = useActionState(saveProviderProfileAction, initial);

  const skillProf = new Map(initialSkills.map((s) => [s.skillId, s.proficiency]));
  const availByDay = new Map(initialAvailability.map((a) => [a.day, a]));

  const [checkedSkills, setCheckedSkills] = useState<Set<string>>(
    () => new Set(initialSkills.map((s) => s.skillId)),
  );
  const [checkedDays, setCheckedDays] = useState<Set<string>>(
    () => new Set(initialAvailability.map((a) => a.day)),
  );

  const categories = [...new Set(catalog.map((s) => s.category))];

  return (
    <form action={action} className="stack" style={{ gap: "1.5rem" }}>
      {state.ok && <p className="notice notice--success">Profile saved.</p>}
      {state.error && <p className="notice notice--error">{state.error}</p>}

      {/* Basics */}
      <div className="stack">
        <div className="field">
          <label htmlFor="headline">Headline</label>
          <input
            id="headline"
            name="headline"
            defaultValue={base.headline}
            placeholder="e.g. Senior SRE - Kubernetes & AWS"
          />
        </div>
        <div className="field">
          <label htmlFor="location">Location</label>
          <input
            id="location"
            name="location"
            defaultValue={base.location}
            placeholder="e.g. Lisbon (WET)"
          />
        </div>
        <div className="field">
          <label htmlFor="bio">About</label>
          <textarea
            id="bio"
            name="bio"
            defaultValue={base.bio}
            placeholder="Your background and how you help people learn."
          />
        </div>
      </div>

      {/* Skills */}
      <div className="stack">
        <div>
          <h2>Skills you offer</h2>
          <p className="muted small">Tick a skill and set your proficiency.</p>
        </div>
        {categories.map((cat) => (
          <fieldset key={cat} style={{ border: "none" }}>
            <legend className="small muted" style={{ marginBottom: "0.4rem" }}>
              {cat}
            </legend>
            <div className="stack" style={{ gap: "0.5rem" }}>
              {catalog
                .filter((s) => s.category === cat)
                .map((s) => {
                  const on = checkedSkills.has(s.id);
                  return (
                    <div key={s.id} className="row" style={{ gap: "0.6rem" }}>
                      <label
                        className="row"
                        style={{ gap: "0.5rem", margin: 0, fontWeight: 500, minWidth: 160 }}
                      >
                        <input
                          type="checkbox"
                          name="skill"
                          value={s.id}
                          checked={on}
                          onChange={(e) =>
                            setCheckedSkills((prev) => {
                              const next = new Set(prev);
                              if (e.target.checked) next.add(s.id);
                              else next.delete(s.id);
                              return next;
                            })
                          }
                          style={{ width: "auto" }}
                        />
                        {s.name}
                      </label>
                      <select
                        name={`prof_${s.id}`}
                        defaultValue={skillProf.get(s.id) ?? "intermediate"}
                        disabled={!on}
                        style={{ width: "auto", opacity: on ? 1 : 0.5 }}
                      >
                        {PROFICIENCIES.map((p) => (
                          <option key={p} value={p}>
                            {p}
                          </option>
                        ))}
                      </select>
                    </div>
                  );
                })}
            </div>
          </fieldset>
        ))}
      </div>

      {/* Availability */}
      <div className="stack">
        <div>
          <h2>Weekly availability</h2>
          <p className="muted small">
            Tick the days you are available and set a time window.
          </p>
        </div>
        <div className="stack" style={{ gap: "0.5rem" }}>
          {DAY_ORDER.map(({ key, label }) => {
            const on = checkedDays.has(key);
            const existing = availByDay.get(key);
            return (
              <div key={key} className="row" style={{ gap: "0.6rem" }}>
                <label
                  className="row"
                  style={{ gap: "0.5rem", margin: 0, fontWeight: 500, minWidth: 120 }}
                >
                  <input
                    type="checkbox"
                    name={`avail_${key}`}
                    checked={on}
                    onChange={(e) =>
                      setCheckedDays((prev) => {
                        const next = new Set(prev);
                        if (e.target.checked) next.add(key);
                        else next.delete(key);
                        return next;
                      })
                    }
                    style={{ width: "auto" }}
                  />
                  {label}
                </label>
                <input
                  type="time"
                  name={`start_${key}`}
                  defaultValue={existing?.start ?? "09:00"}
                  disabled={!on}
                  style={{ width: "auto", opacity: on ? 1 : 0.5 }}
                  aria-label={`${label} start time`}
                />
                <span className="muted">to</span>
                <input
                  type="time"
                  name={`end_${key}`}
                  defaultValue={existing?.end ?? "17:00"}
                  disabled={!on}
                  style={{ width: "auto", opacity: on ? 1 : 0.5 }}
                  aria-label={`${label} end time`}
                />
              </div>
            );
          })}
        </div>
      </div>

      <button className="btn btn--primary" type="submit" disabled={pending}>
        {pending ? "Saving..." : "Save profile"}
      </button>
    </form>
  );
}
