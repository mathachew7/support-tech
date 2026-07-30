"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { saveProviderSkillsAction, type ProfileState } from "../actions";
import { useOutside } from "@/app/_components/ui/use-outside";
import ui from "@/app/_components/ui/ui.module.css";

export type CatalogSkill = { id: string; name: string; category: string };
export type InitialSkill = { skillId: string; proficiency: string };

const PROFICIENCIES = ["beginner", "intermediate", "advanced", "expert"] as const;
const initial: ProfileState = {};

type Selected = { skillId?: string; name: string; proficiency: string };

export function ProviderSkillsForm({
  catalog,
  initialSkills,
}: {
  catalog: CatalogSkill[];
  initialSkills: InitialSkill[];
}) {
  const [state, action, pending] = useActionState(saveProviderSkillsAction, initial);

  // Show the "saved" confirmation briefly, then let it fade out.
  const [showSaved, setShowSaved] = useState(false);
  useEffect(() => {
    if (!state.ok) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setShowSaved(true);
    const t = setTimeout(() => setShowSaved(false), 2000);
    return () => clearTimeout(t);
  }, [state]);

  const nameById = new Map(catalog.map((c) => [c.id, c.name]));
  const [selected, setSelected] = useState<Selected[]>(() =>
    initialSkills.map((s) => ({
      skillId: s.skillId,
      name: nameById.get(s.skillId) ?? s.skillId,
      proficiency: s.proficiency,
    })),
  );
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  useOutside(ref, () => setOpen(false), open);

  const PER_PAGE = 6;
  const totalPages = Math.max(1, Math.ceil(selected.length / PER_PAGE));
  const clampedPage = Math.min(page, totalPages - 1);
  const paginated = selected.length > PER_PAGE;
  const isVisible = (i: number) =>
    i >= clampedPage * PER_PAGE && i < clampedPage * PER_PAGE + PER_PAGE;

  const selectedNames = new Set(selected.map((s) => s.name.toLowerCase()));
  const nq = q.trim().toLowerCase();
  const matches = catalog
    .filter((c) => !selectedNames.has(c.name.toLowerCase()))
    .filter((c) => (nq ? c.name.toLowerCase().includes(nq) || c.category.toLowerCase().includes(nq) : true))
    .slice(0, 10);
  const exactExists =
    catalog.some((c) => c.name.toLowerCase() === nq) || selectedNames.has(nq);

  const addName = (name: string, skillId?: string) => {
    const key = name.trim().toLowerCase();
    if (!key || selectedNames.has(key)) return;
    setSelected((p) => [...p, { skillId, name: name.trim(), proficiency: "intermediate" }]);
    setQ("");
  };
  const remove = (name: string) =>
    setSelected((p) => p.filter((s) => s.name !== name));
  const setProf = (name: string, prof: string) =>
    setSelected((p) => p.map((s) => (s.name === name ? { ...s, proficiency: prof } : s)));

  return (
    <form action={action} className="stack" style={{ gap: "1.25rem" }}>
      {showSaved && <p className="notice notice--success">Skills saved.</p>}
      {state.error && <p className="notice notice--error">{state.error}</p>}

      {/* Search to add */}
      <div className={ui.control} ref={ref}>
        <input
          value={q}
          placeholder="Search skills to add, e.g. Kubernetes, Go, System Design…"
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          autoComplete="off"
        />
        {open && (matches.length > 0 || (nq && !exactExists)) && (
          <div className={ui.popover}>
            <div className={ui.list}>
              {matches.map((c) => (
                <button type="button" key={c.id} className={ui.option} onClick={() => addName(c.name, c.id)}>
                  <span>{c.name}</span>
                  <span className={ui.optionSub}>{c.category}</span>
                </button>
              ))}
              {nq && !exactExists && (
                <button
                  type="button"
                  className={`${ui.option} ${ui.addCustom}`}
                  onClick={() => addName(q)}
                >
                  Add &ldquo;{q.trim()}&rdquo;
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Selected skills */}
      {selected.length === 0 ? (
        <p className="muted small" style={{ margin: 0 }}>
          No skills yet. Search above to add the ones you teach.
        </p>
      ) : (
        <div className="stack" style={{ gap: "0.5rem" }}>
          {selected.map((s, i) => (
            // Rows past the limit are hidden (not removed) when collapsed, so
            // every selected skill still submits with the form.
            <div
              key={s.name}
              className="row between"
              style={{ gap: "0.6rem", display: isVisible(i) ? undefined : "none" }}
            >
              <input type="hidden" name="skillName" value={s.name} />
              <span style={{ fontWeight: 600 }}>{s.name}</span>
              <div className="row" style={{ gap: "0.5rem" }}>
                <select
                  name="proficiency"
                  value={s.proficiency}
                  onChange={(e) => setProf(s.name, e.target.value)}
                  style={{ width: "auto" }}
                  aria-label={`${s.name} proficiency`}
                >
                  {PROFICIENCIES.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
                <button type="button" className="btn btn--small" onClick={() => remove(s.name)}>
                  Remove
                </button>
              </div>
            </div>
          ))}
          {paginated && (
            <div className="row" style={{ gap: "0.5rem", marginTop: "0.25rem" }}>
              <button
                type="button"
                className="btn btn--small"
                onClick={() => setPage(clampedPage - 1)}
                disabled={clampedPage === 0}
              >
                ← Prev
              </button>
              <span className="muted small">
                Page {clampedPage + 1} of {totalPages}
              </span>
              <button
                type="button"
                className="btn btn--small"
                onClick={() => setPage(clampedPage + 1)}
                disabled={clampedPage >= totalPages - 1}
              >
                Next →
              </button>
            </div>
          )}
        </div>
      )}

      <button className="btn btn--primary" type="submit" disabled={pending} style={{ alignSelf: "flex-start" }}>
        {pending ? "Saving…" : "Save skills"}
      </button>
    </form>
  );
}
