import { StatusBadge } from "./StatusBadge";
import { whenLabel } from "./format";

// A booking row as returned by getSeekerBookings (skill + optional provider).
export type SessionRow = {
  id: string;
  datetime: Date;
  status: string;
  skill: { name: string };
  provider: { name: string } | null;
};

/** Reusable sessions table. Renders `empty` when there are no rows. */
export function SessionsTable({
  rows,
  empty,
}: {
  rows: SessionRow[];
  empty?: React.ReactNode;
}) {
  if (rows.length === 0) {
    return <>{empty ?? <p className="muted small">Nothing here yet.</p>}</>;
  }

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>When</th>
            <th>Skill</th>
            <th>Provider</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id}>
              <td>{whenLabel(r.datetime)}</td>
              <td>{r.skill.name}</td>
              <td>{r.provider?.name ?? "-"}</td>
              <td>
                <StatusBadge status={r.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
