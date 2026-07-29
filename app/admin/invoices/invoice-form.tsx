"use client";

import { useActionState } from "react";
import { createInvoiceAction, type InvoiceFormState } from "./actions";

const initial: InvoiceFormState = {};

type SeekerOpt = { id: string; name: string; email: string };

export default function InvoiceForm({ seekers }: { seekers: SeekerOpt[] }) {
  const [state, action, pending] = useActionState(createInvoiceAction, initial);

  return (
    <form action={action} className="stack">
      {state.ok && <p className="notice notice--success">Invoice issued.</p>}
      {state.error && <p className="notice notice--error">{state.error}</p>}

      <div className="row" style={{ gap: "1rem", alignItems: "flex-end", flexWrap: "wrap" }}>
        <div className="field" style={{ flex: "2 1 220px" }}>
          <label htmlFor="seekerId">Seeker</label>
          <select id="seekerId" name="seekerId" required defaultValue="">
            <option value="" disabled>Choose a seeker…</option>
            {seekers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.email})
              </option>
            ))}
          </select>
        </div>
        <div className="field" style={{ flex: "1 1 120px" }}>
          <label htmlFor="amount">Amount (USD)</label>
          <input id="amount" name="amount" inputMode="decimal" placeholder="49.99" required />
        </div>
        <div className="field" style={{ flex: "1 1 150px" }}>
          <label htmlFor="dueDate">Due date (optional)</label>
          <input id="dueDate" name="dueDate" type="date" />
        </div>
      </div>

      <div className="row" style={{ gap: "1rem", alignItems: "flex-end", flexWrap: "wrap" }}>
        <div className="field" style={{ flex: "2 1 200px" }}>
          <label htmlFor="planName">Plan (optional)</label>
          <input id="planName" name="planName" placeholder="e.g. 3-month mentorship" />
        </div>
        <div className="field" style={{ flex: "1 1 140px" }}>
          <label htmlFor="periodLabel">Billing period</label>
          <input id="periodLabel" name="periodLabel" placeholder="e.g. August 2026" />
        </div>
        <div className="field" style={{ flex: "0 1 90px" }}>
          <label htmlFor="periodIndex">Invoice #</label>
          <input id="periodIndex" name="periodIndex" type="number" min="1" placeholder="2" />
        </div>
        <div className="field" style={{ flex: "0 1 90px" }}>
          <label htmlFor="periodTotal">of</label>
          <input id="periodTotal" name="periodTotal" type="number" min="1" placeholder="3" />
        </div>
      </div>

      <div className="field">
        <label htmlFor="description">Description (optional)</label>
        <input id="description" name="description" placeholder="Notes shown on the invoice" />
      </div>

      <button className="btn btn--primary" type="submit" disabled={pending} style={{ alignSelf: "flex-start" }}>
        {pending ? "Issuing…" : "Issue invoice"}
      </button>
    </form>
  );
}
