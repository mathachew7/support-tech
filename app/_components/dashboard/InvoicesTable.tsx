"use client";

import { useRouter } from "next/navigation";
import { InvoiceStatusBadge } from "./InvoiceStatusBadge";
import { planLabel, periodText } from "./invoice-format";

export type InvoiceRow = {
  id: string;
  number: string;
  planName: string | null;
  description: string | null;
  periodLabel: string | null;
  periodIndex: number | null;
  periodTotal: number | null;
  status: string;
  issuedAt: Date;
};

/** Clickable seeker invoice list. Each row opens the full invoice. */
export function InvoicesTable({
  rows,
  empty,
}: {
  rows: InvoiceRow[];
  empty?: React.ReactNode;
}) {
  const router = useRouter();
  if (rows.length === 0) {
    return <>{empty ?? <p className="muted small">No invoices yet.</p>}</>;
  }
  const open = (id: string) => router.push(`/seekers/dashboard/payments/${id}`);

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Invoice</th>
            <th>Plan</th>
            <th>Billing period</th>
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
              <td style={{ fontWeight: 700 }}>{r.number}</td>
              <td>{planLabel(r)}</td>
              <td>{periodText(r)}</td>
              <td>
                <InvoiceStatusBadge status={r.status} />
              </td>
              <td className="muted" aria-hidden>›</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
