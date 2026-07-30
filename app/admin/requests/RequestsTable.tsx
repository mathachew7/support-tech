"use client";

import { useState } from "react";
import Link from "next/link";

export type AdminRequestRow = {
  id: string;
  seekerName: string;
  seekerEmail: string;
  skillName: string;
  commitmentMonths: number;
  timezone: string;
  requestedDate: string;
};

export function AdminRequestsTable({ rows }: { rows: AdminRequestRow[] }) {
  const [q, setQ] = useState("");
  const nq = q.trim().toLowerCase();
  const filtered = nq
    ? rows.filter((r) =>
        `${r.seekerName} ${r.seekerEmail} ${r.skillName}`.toLowerCase().includes(nq),
      )
    : rows;

  return (
    <div className="stack" style={{ gap: "1rem" }}>
      <div className="field" style={{ maxWidth: "22rem" }}>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by seeker, email, or skill…"
          autoComplete="off"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="muted small" style={{ margin: 0 }}>
          {rows.length === 0 ? "No open requests. All caught up. 🎉" : "No requests match your search."}
        </p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Seeker</th>
                <th>Package</th>
                <th>Timezone</th>
                <th>Requested date</th>
                <th aria-hidden />
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id}>
                  <td>
                    {r.seekerName}
                    <div className="muted small">{r.seekerEmail}</div>
                  </td>
                  <td>
                    <div>{r.skillName}</div>
                    <div className="muted small">{r.commitmentMonths}-month plan</div>
                  </td>
                  <td className="muted small">{r.timezone.replace(/_/g, " ")}</td>
                  <td className="muted small">{r.requestedDate}</td>
                  <td>
                    <Link href={`/admin/requests/${r.id}`} className="btn btn--primary btn--small">
                      Match &amp; assign
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
