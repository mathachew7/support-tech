"use client";

import { useActionState } from "react";
import { requestSessionAction, type RequestState } from "./actions";

const initial: RequestState = {};

type SkillOpt = { id: string; name: string; category: string };

export default function RequestForm({ skills }: { skills: SkillOpt[] }) {
  const [state, action, pending] = useActionState(requestSessionAction, initial);

  // Group skills by category for the <select>.
  const byCategory = new Map<string, SkillOpt[]>();
  for (const s of skills) {
    const list = byCategory.get(s.category) ?? [];
    list.push(s);
    byCategory.set(s.category, list);
  }

  return (
    <div className="stack" style={{ gap: "1.25rem" }}>
      <form action={action} className="stack">
        <div className="field">
          <label htmlFor="skillId">What do you need help with?</label>
          <select id="skillId" name="skillId" required defaultValue="">
            <option value="" disabled>
              Choose a skill…
            </option>
            {[...byCategory.entries()].map(([cat, list]) => (
              <optgroup key={cat} label={cat}>
                {list.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="datetime">Preferred date &amp; time</label>
          <input id="datetime" name="datetime" type="datetime-local" required />
          <p className="muted small" style={{ marginTop: "0.3rem" }}>
            Sessions are 60 minutes. We&apos;ll match providers free at this time.
          </p>
        </div>

        <div className="field">
          <label htmlFor="note">Anything specific? (optional)</label>
          <textarea
            id="note"
            name="note"
            placeholder="e.g. I&apos;m stuck debugging a failing Helm deploy on EKS."
          />
        </div>

        <button className="btn btn--primary" type="submit" disabled={pending}>
          {pending ? "Finding providers…" : "Request session"}
        </button>
      </form>

      {state.error && <p className="notice notice--error">{state.error}</p>}

      {state.ok && (
        <div className="stack" style={{ gap: "0.75rem" }}>
          {state.suggestions && state.suggestions.length > 0 ? (
            <>
              <p className="notice notice--success">
                Request submitted. {state.suggestions.length} provider
                {state.suggestions.length === 1 ? "" : "s"} match your skill and
                time. An admin will confirm your session.
              </p>
              <h2>Suggested providers</h2>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Provider</th>
                      <th>Proficiency</th>
                    </tr>
                  </thead>
                  <tbody>
                    {state.suggestions.map((s) => (
                      <tr key={s.providerId}>
                        <td>{s.name}</td>
                        <td>
                          <span className="badge badge--role">
                            {s.proficiency ?? "-"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <p className="notice notice--info">
              Request submitted, but no approved provider is free for that skill
              and time yet. An admin will follow up, or try another time.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
