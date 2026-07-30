"use client";

import { useRouter } from "next/navigation";
import { StatusBadge } from "./StatusBadge";

export type SeekerRow = {
  seekerId: string;
  name: string;
  plan: string | null;
  commitmentMonths: number | null;
  currentMonth: string | null;
  sessions: number;
  status: string;
};

export function MySeekersTable({
  rows,
  empty,
}: {
  rows: SeekerRow[];
  empty?: React.ReactNode;
}) {
  const router = useRouter();
  if (rows.length === 0) {
    return <>{empty ?? <p className="muted small">No seekers yet.</p>}</>;
  }
  const open = (id: string) => router.push(`/providers/dashboard/seekers/${id}`);

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Seeker</th>
            <th>Package</th>
            <th>Current month</th>
            <th>Sessions</th>
            <th>Status</th>
            <th aria-hidden />
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr
              key={r.seekerId}
              className="clickable"
              onClick={() => open(r.seekerId)}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  open(r.seekerId);
                }
              }}
            >
              <td style={{ fontWeight: 600 }}>{r.name}</td>
              <td>
                {r.plan ? (
                  <>
                    <div>{r.plan}</div>
                    {r.commitmentMonths && (
                      <div className="muted small">{r.commitmentMonths}-month plan</div>
                    )}
                  </>
                ) : (
                  <span className="muted">-</span>
                )}
              </td>
              <td>{r.currentMonth ?? <span className="muted">-</span>}</td>
              <td>{r.sessions}</td>
              <td>
                <StatusBadge status={r.status} />
              </td>
              <td className="muted" aria-hidden>›</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
