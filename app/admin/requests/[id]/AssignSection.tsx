"use client";

import { useState } from "react";
import { AssignForm, type ProviderOption, type TimeOption } from "./AssignForm";

export function AssignSection({
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
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <div className="card">
        <div className="row between" style={{ alignItems: "center", flexWrap: "wrap", gap: "0.75rem" }}>
          <div>
            <h2 style={{ fontSize: "1.05rem" }}>Ready to match?</h2>
            <p className="muted small" style={{ margin: "0.2rem 0 0" }}>
              Assign a provider and schedule the first session.
            </p>
          </div>
          <button className="btn btn--primary" type="button" onClick={() => setOpen(true)}>
            Assign a provider
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="card stack">
      <div className="row between">
        <h2 style={{ fontSize: "1.05rem" }}>Assign a provider</h2>
        <button className="btn btn--small" type="button" onClick={() => setOpen(false)}>
          Cancel
        </button>
      </div>
      <AssignForm
        requestId={requestId}
        requestSkills={requestSkills}
        times={times}
        providers={providers}
      />
    </div>
  );
}
