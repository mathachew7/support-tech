"use client";

import { useRouter } from "next/navigation";
import { StatusBadge } from "./StatusBadge";

export type RequestRow = {
  id: string;
  reference: string | null;
  skillName: string;
  commitmentMonths: number;
  startDate: Date;
  endDate: Date;
  createdAt: Date;
  status: string;
  times: { id: string; datetime: Date }[];
};

function monthLabel(d: Date) {
  return d.toLocaleDateString(undefined, { month: "short", year: "numeric" });
}
function dateLabel(d: Date) {
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

/** Clickable table of session requests. Each row opens its detail page. */
export function RequestsTable({
  rows,
  empty,
  hrefBase = "/seekers/dashboard/sessions",
}: {
  rows: RequestRow[];
  empty?: React.ReactNode;
  hrefBase?: string;
}) {
  const router = useRouter();

  if (rows.length === 0) {
    return <>{empty ?? <p className="muted small">Nothing here yet.</p>}</>;
  }

  const open = (id: string) => router.push(`${hrefBase}/${id}`);

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Ref</th>
            <th>Requested</th>
            <th>Skills</th>
            <th>Commitment</th>
            <th>Status</th>
            <th aria-hidden />
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr
              key={r.id}
              className="clickable"
              onClick={() => open(r.id)}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  open(r.id);
                }
              }}
            >
              <td style={{ fontWeight: 700 }}>{r.reference ?? "-"}</td>
              <td>{dateLabel(r.createdAt)}</td>
              <td>{r.skillName}</td>
              <td>
                {r.commitmentMonths} mo
                <span className="muted small">
                  {" "}
                  ({monthLabel(r.startDate)} – {monthLabel(r.endDate)})
                </span>
              </td>
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
