"use client";

import { useRouter } from "next/navigation";
import { StatusBadge } from "./StatusBadge";
import { whenLabel } from "./format";

export type ProviderSessionRow = {
  id: string;
  reference: string | null;
  datetime: Date;
  status: string;
  seeker: { name: string } | null;
  skill: { name: string } | null;
  request: { skillName: string; commitmentMonths: number } | null;
};

export function ProviderSessionsTable({
  rows,
  empty,
}: {
  rows: ProviderSessionRow[];
  empty?: React.ReactNode;
}) {
  const router = useRouter();
  if (rows.length === 0) {
    return <>{empty ?? <p className="muted small">Nothing here yet.</p>}</>;
  }
  const open = (id: string) => router.push(`/providers/dashboard/sessions/${id}`);

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Reference</th>
            <th>When</th>
            <th>Seeker</th>
            <th>Package</th>
            <th>Status</th>
            <th aria-hidden />
          </tr>
        </thead>
        <tbody>
          {rows.map((b) => (
            <tr
              key={b.id}
              className="clickable"
              onClick={() => open(b.id)}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  open(b.id);
                }
              }}
            >
              <td style={{ fontWeight: 700 }}>{b.reference ?? "-"}</td>
              <td>{whenLabel(b.datetime)}</td>
              <td>{b.seeker?.name ?? "-"}</td>
              <td>
                {b.request ? (
                  <>
                    <div style={{ fontWeight: 600 }}>{b.request.skillName}</div>
                    <div className="muted small">{b.request.commitmentMonths}-month plan</div>
                  </>
                ) : (
                  b.skill?.name ?? "-"
                )}
              </td>
              <td>
                <StatusBadge status={b.status} />
              </td>
              <td className="muted" aria-hidden>›</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
