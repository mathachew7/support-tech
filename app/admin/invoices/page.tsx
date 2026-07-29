import { auth } from "@/lib/auth/auth";
import DashboardShell from "@/app/_components/DashboardShell";
import { InvoiceStatusBadge } from "@/app/_components/dashboard/InvoiceStatusBadge";
import { listSeekers } from "@/lib/services/admin";
import { listAllInvoices } from "@/lib/services/invoices";
import { formatMoney } from "@/lib/services/invoices-core";
import InvoiceForm from "./invoice-form";
import { markPaidAction } from "./actions";

function d(date: Date | null) {
  return date ? date.toLocaleDateString(undefined, { dateStyle: "medium" }) : "-";
}

export default async function AdminInvoicesPage() {
  const session = await auth();
  const [seekers, invoices] = await Promise.all([listSeekers(), listAllInvoices()]);

  return (
    <DashboardShell
      user={{ name: session!.user!.name!, email: session!.user!.email, role: "admin" }}
      title="Invoices"
    >
      <div className="stack" style={{ gap: "1.5rem" }}>
        <div className="card stack">
          <h2>Issue an invoice</h2>
          <InvoiceForm seekers={seekers} />
        </div>

        <div className="card stack">
          <h2>All invoices</h2>
          {invoices.length === 0 ? (
            <p className="muted small" style={{ margin: 0 }}>No invoices issued yet.</p>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Invoice</th>
                    <th>Seeker</th>
                    <th>Issued</th>
                    <th>Due</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((i) => (
                    <tr key={i.id}>
                      <td style={{ fontWeight: 700 }}>{i.number}</td>
                      <td>
                        {i.seeker.name}
                        <span className="muted small"> · {i.seeker.email}</span>
                      </td>
                      <td>{d(i.issuedAt)}</td>
                      <td>{d(i.dueDate)}</td>
                      <td>{formatMoney(i.amountCents, i.currency)}</td>
                      <td><InvoiceStatusBadge status={i.status} /></td>
                      <td>
                        {i.status === "pending" ? (
                          <form action={markPaidAction}>
                            <input type="hidden" name="invoiceId" value={i.id} />
                            <button className="btn btn--small btn--primary" type="submit">
                              Mark paid
                            </button>
                          </form>
                        ) : (
                          <span className="muted small">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
