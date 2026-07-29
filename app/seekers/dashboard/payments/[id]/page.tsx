import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import DashboardShell from "@/app/_components/DashboardShell";
import { InvoiceStatusBadge } from "@/app/_components/dashboard/InvoiceStatusBadge";
import { getSeekerInvoice } from "@/lib/services/invoices";
import { formatMoney } from "@/lib/services/invoices-core";
import { addressLines } from "@/app/_components/dashboard/invoice-format";
import { PrintButton } from "./PrintButton";
import styles from "./invoice.module.css";

function d(date: Date | null) {
  return date ? date.toLocaleDateString(undefined, { dateStyle: "medium" }) : "-";
}

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [session, { id }] = await Promise.all([auth(), params]);
  const seekerId = session!.user!.id!;
  const inv = await getSeekerInvoice(seekerId, id);
  if (!inv) notFound();

  const plan = inv.planName || inv.description || "Mentorship";
  const period =
    [inv.periodLabel, inv.periodIndex && inv.periodTotal ? `Invoice ${inv.periodIndex} of ${inv.periodTotal}` : ""]
      .filter(Boolean)
      .join(" · ") || null;
  const amount = formatMoney(inv.amountCents, inv.currency);

  return (
    <DashboardShell
      user={{ name: session!.user!.name!, email: session!.user!.email, role: "seeker" }}
      title="Invoice"
    >
      <div className={styles.toolbar}>
        <Link href="/seekers/dashboard/payments" className="small">
          ← Back to payments
        </Link>
        <PrintButton />
      </div>

      <div className={styles.doc}>
        {/* Top: meta left, logo/issuer right */}
        <div className={styles.top}>
          <div>
            <h1 className={styles.title}>Invoice</h1>
            <div className={styles.metaGrid}>
              <span className={styles.metaK}>Invoice number</span>
              <span className={styles.metaV}>{inv.number}</span>
              <span className={styles.metaK}>Date of issue</span>
              <span className={styles.metaV}>{d(inv.issuedAt)}</span>
              <span className={styles.metaK}>Date due</span>
              <span className={styles.metaV}>{d(inv.dueDate)}</span>
            </div>
          </div>
          <div className={styles.topRight}>
            <div className={styles.brand}>
              <span className={styles.mark}>J</span>
              JoslaLink
            </div>
          </div>
        </div>

        {/* From / Bill to */}
        <div className={styles.parties}>
          <div className={styles.party}>
            <div className={styles.itemName}>JoslaTech LLC</div>
            <div className={styles.muted}>123 Example Street</div>
            <div className={styles.muted}>Austin, TX 78701</div>
            <div className={styles.muted}>United States</div>
          </div>
          <div className={styles.party}>
            <div className={styles.blockTitle}>Bill to</div>
            <div>{inv.seeker.name}</div>
            {addressLines(inv.seeker).map((line) => (
              <div key={line} className={styles.muted}>{line}</div>
            ))}
            <div className={styles.muted}>{inv.seeker.email}</div>
          </div>
        </div>

        {/* Prominent amount line */}
        <div className={styles.amountLine}>
          <span>{amount} USD</span>
          <span className={styles.amountLineSub}>
            {inv.status === "paid" ? `paid on ${d(inv.paidAt)}` : `due ${d(inv.dueDate)}`}
          </span>
          <InvoiceStatusBadge status={inv.status} />
        </div>

        {/* Line items */}
        <table className={styles.items}>
          <thead>
            <tr>
              <th>Description</th>
              <th className={styles.right}>Qty</th>
              <th className={styles.right}>Unit price</th>
              <th className={styles.right}>Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <div className={styles.itemName}>{plan}</div>
                {period && <div className={styles.itemSub}>{period}</div>}
                {inv.description && inv.description !== plan && (
                  <div className={styles.itemSub}>{inv.description}</div>
                )}
              </td>
              <td className={styles.right}>1</td>
              <td className={styles.right}>{amount}</td>
              <td className={`${styles.right} ${styles.itemName}`}>{amount}</td>
            </tr>
          </tbody>
        </table>

        {/* Totals */}
        <div className={styles.totals}>
          <div className={styles.totalsInner}>
            <div className={styles.totalsRow}>
              <span>Subtotal</span>
              <span>{amount}</span>
            </div>
            <div className={styles.totalsRow}>
              <span>Total</span>
              <span>{amount}</span>
            </div>
            <div className={`${styles.totalsRow} ${styles.grand}`}>
              <span>{inv.status === "paid" ? "Amount paid" : "Amount due"}</span>
              <span>{amount} USD</span>
            </div>
          </div>
        </div>

        <div className={styles.footer}>
          {inv.status === "paid"
            ? `Paid on ${d(inv.paidAt)} - thank you for your business!`
            : "Thank you for choosing JoslaLink."}
        </div>
      </div>
    </DashboardShell>
  );
}
