"use client";

import { useActionState, useMemo, useState } from "react";
import { assignProviderAction, type AssignState } from "../../actions";
import { DatePicker } from "@/app/_components/ui/DatePicker";
import { TimePicker } from "@/app/_components/ui/TimePicker";

export type ProviderOption = {
  id: string;
  name: string;
  headline: string | null;
  skills: string[];
  availabilityDays: number;
};
export type TimeOption = { iso: string; label: string };

const initial: AssignState = {};

export function AssignForm({
  requestId,
  requestSkills,
  times,
  providers,
}: {
  requestId: string;
  requestSkills: string[];
  times: TimeOption[];
  providers: ProviderOption[];
}) {
  const [state, action, pending] = useActionState(assignProviderAction, initial);
  const [providerId, setProviderId] = useState("");
  const firstIso = times[0]?.iso ?? "";
  const [date, setDate] = useState(firstIso ? firstIso.split("T")[0] : "");
  const [time, setTime] = useState(firstIso ? firstIso.split("T")[1] : "");
  const datetime = date && time ? `${date}T${time}` : "";
  const [q, setQ] = useState("");
  const [auto, setAuto] = useState(false); // auto-rank by skill only when asked

  const wanted = requestSkills.map((s) => s.toLowerCase());
  // Split the query into terms; a provider matches when every term hits its
  // name or one of its skills ("java aws" -> has both).
  const terms = q.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const matchCount = (p: ProviderOption) =>
    p.skills.filter((s) => wanted.includes(s.toLowerCase())).length;

  const skillMatchesQuery = (s: string) => terms.some((t) => s.toLowerCase().includes(t));

  // Order a provider's skills so the ones you searched for / requested show first.
  const skillRank = (s: string) => {
    if (terms.length && skillMatchesQuery(s)) return 0;
    if (auto && wanted.includes(s.toLowerCase())) return 1;
    return 2;
  };

  const list = useMemo(() => {
    const arr = providers.filter((p) => {
      if (terms.length === 0) return true;
      const hay = `${p.name} ${p.skills.join(" ")}`.toLowerCase();
      return terms.every((t) => hay.includes(t));
    });
    return auto
      ? [...arr].sort((a, b) => matchCount(b) - matchCount(a) || a.name.localeCompare(b.name))
      : [...arr].sort((a, b) => a.name.localeCompare(b.name));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, auto, providers]);

  return (
    <form action={action} className="stack" style={{ gap: "1.1rem" }}>
      <input type="hidden" name="requestId" value={requestId} />
      <input type="hidden" name="providerId" value={providerId} />

      {state.error && <p className="notice notice--error">{state.error}</p>}

      {/* Search + auto-match */}
      <div className="row between" style={{ gap: "0.75rem", flexWrap: "wrap", alignItems: "flex-end" }}>
        <div className="field" style={{ flex: "1 1 16rem", marginBottom: 0 }}>
          <label htmlFor="provsearch">Search providers by skill or name</label>
          <input
            id="provsearch"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="e.g. Kubernetes, or a name…"
            autoComplete="off"
          />
        </div>
        <button
          type="button"
          className={`btn ${auto ? "btn--primary" : ""}`}
          onClick={() => setAuto((v) => !v)}
        >
          {auto ? "✓ Auto-matched" : "Auto-match by skill"}
        </button>
      </div>

      {auto && (
        <p className="muted small" style={{ margin: 0 }}>
          Ranked by how many of the requested skills each provider offers.
        </p>
      )}

      {/* Provider list - only after a search or auto-match */}
      {!auto && !q.trim() ? (
        <p className="muted small" style={{ margin: 0 }}>
          Search by skill or name above, or use <strong>Auto-match by skill</strong> to see providers.
        </p>
      ) : (
      <div className="stack" style={{ gap: "0.5rem" }}>
        {list.length === 0 && (
          <p className="muted small" style={{ margin: 0 }}>No providers match.</p>
        )}
        {list.map((p) => {
          const selected = providerId === p.id;
          const m = matchCount(p);
          return (
            <button
              type="button"
              key={p.id}
              onClick={() => setProviderId(p.id)}
              className="card"
              style={{
                textAlign: "left",
                cursor: "pointer",
                borderColor: selected ? "var(--accent)" : undefined,
                boxShadow: selected ? "0 0 0 2px var(--accent-weak)" : undefined,
                padding: "0.9rem 1rem",
              }}
            >
              <div className="row between">
                <div>
                  <div style={{ fontWeight: 700 }}>{p.name}</div>
                  {p.headline && <div className="muted small">{p.headline}</div>}
                </div>
                {auto && (
                  <span className={`badge ${m > 0 ? "badge--approved" : "badge--muted"}`}>
                    {m}/{requestSkills.length} skills
                  </span>
                )}
              </div>
              <div className="row" style={{ gap: "0.35rem", marginTop: "0.5rem", flexWrap: "wrap" }}>
                {[...p.skills].sort((a, b) => skillRank(a) - skillRank(b)).slice(0, 10).map((s) => {
                  const l = s.toLowerCase();
                  const hit = skillMatchesQuery(s) || (auto && wanted.includes(l));
                  return (
                    <span
                      key={s}
                      className="badge"
                      style={{
                        background: hit ? "var(--accent-weak)" : "var(--background)",
                        color: hit ? "var(--accent)" : "var(--muted)",
                        border: "1px solid var(--border)",
                      }}
                    >
                      {s}
                    </span>
                  );
                })}
                <span className="muted small" style={{ marginLeft: "auto" }}>
                  {p.availabilityDays} day{p.availabilityDays === 1 ? "" : "s"} available/wk
                </span>
              </div>
            </button>
          );
        })}
      </div>
      )}

      {/* Session date & time - separate pickers */}
      <div className="field">
        <label>Session date &amp; time</label>
        <input type="hidden" name="datetime" value={datetime} />
        {times.length > 0 && (
          <div className="row" style={{ gap: "0.4rem", flexWrap: "wrap", marginBottom: "0.5rem" }}>
            <span className="muted small">Seeker preferred:</span>
            {times.map((t) => (
              <button
                type="button"
                key={t.iso}
                className="btn btn--small"
                onClick={() => {
                  const [d, tm] = t.iso.split("T");
                  setDate(d);
                  setTime(tm);
                }}
                style={{ borderColor: datetime === t.iso ? "var(--accent)" : undefined }}
              >
                {t.label}
              </button>
            ))}
          </div>
        )}
        <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: "0.75rem" }}>
          <DatePicker value={date} onChange={setDate} placeholder="Pick a date" />
          <TimePicker value={time} onChange={setTime} />
        </div>
      </div>

      {/* Note */}
      <div className="field">
        <label htmlFor="note">Note for the provider (optional)</label>
        <textarea id="note" name="note" placeholder="Anything the provider should know before the session." />
      </div>

      <button className="btn btn--primary" type="submit" disabled={pending || !providerId || !datetime}>
        {pending ? "Assigning…" : "Assign provider & schedule"}
      </button>
    </form>
  );
}
