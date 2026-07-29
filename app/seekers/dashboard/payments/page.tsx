import Link from "next/link";
import { auth } from "@/lib/auth/auth";
import DashboardShell from "@/app/_components/DashboardShell";
import { InvoiceStatusBadge } from "@/app/_components/dashboard/InvoiceStatusBadge";
import { InvoicesTable } from "@/app/_components/dashboard/InvoicesTable";
import { planLabel, periodText } from "@/app/_components/dashboard/invoice-format";
import { listSeekerInvoices } from "@/lib/services/invoices";

export default async function SeekerPaymentsPage() {
  const session = await auth();
  const invoices = await listSeekerInvoices(session!.user!.id!);

  // The invoice needing attention: newest pending, else newest overall.
  const current = invoices.find((i) => i.status === "pending") ?? invoices[0];

  return (
    <DashboardShell
      user={{ name: session!.user!.name!, email: session!.user!.email, role: "seeker" }}
      title="Payments"
    >
      <div className="stack" style={{ gap: "1.5rem" }}>
        <p className="muted small" style={{ margin: 0 }}>
          Invoices issued to you by the JoslaLink team. Click any invoice to view
          or download it. Online payment is coming soon.
        </p>

        {current && (
          <Link
            href={`/seekers/dashboard/payments/${current.id}`}
            className="card spotlight"
            style={{ display: "block", textDecoration: "none", color: "inherit" }}
          >
            <div className="row between" style={{ alignItems: "flex-start" }}>
              <div className="stack" style={{ gap: "0.5rem" }}>
                <span className="spotlight__eyebrow">
                  {current.status === "pending" ? "Current invoice" : "Latest invoice"}
                </span>
                <h2 style={{ fontSize: "1.35rem" }}>{planLabel(current)}</h2>
                <p className="muted small" style={{ margin: 0 }}>
                  {current.number} · {periodText(current)}
                </p>
              </div>
              <InvoiceStatusBadge status={current.status} />
            </div>
          </Link>
        )}

        <div className="card stack">
          <h2>All invoices</h2>
          <InvoicesTable
            rows={invoices}
            empty={
              <p className="muted small" style={{ margin: 0 }}>
                No invoices yet. When the team issues one, it&apos;ll appear here.
              </p>
            }
          />
        </div>
      </div>
    </DashboardShell>
  );
}
