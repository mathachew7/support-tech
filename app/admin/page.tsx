import Link from "next/link";
import { auth } from "@/lib/auth/auth";
import DashboardShell from "@/app/_components/DashboardShell";
import { StatCard } from "@/app/_components/dashboard/StatCard";
import { getAdminStats, getOpenRequests } from "@/lib/services/admin";
import { whenLabel } from "@/app/_components/dashboard/format";

export default async function AdminOverview() {
  const session = await auth();
  const [stats, open] = await Promise.all([getAdminStats(), getOpenRequests()]);
  const queue = open.slice(0, 5);

  return (
    <DashboardShell
      user={{ name: session!.user!.name!, email: session!.user!.email, role: "admin" }}
      title="Overview"
    >
      <div className="stack" style={{ gap: "1.5rem" }}>
        <div className="stack" style={{ gap: "0.35rem" }}>
          <h1>Admin overview</h1>
          <p className="muted small">Everything waiting on you, in one place.</p>
        </div>

        {/* Work-queue stats */}
        <div className="statGrid">
          <StatCard value={stats.openRequests} label="Requests to match" tone="amber" />
          <StatCard value={stats.pendingProviders} label="Providers to approve" />
          <StatCard value={stats.scheduledSessions} label="Scheduled sessions" tone="teal" />
          <StatCard value={stats.pendingInvoices} label="Unpaid invoices" />
        </div>

        {/* Requests queue */}
        <div className="card stack">
          <div className="row between">
            <h2 style={{ fontSize: "1.05rem" }}>Requests to match</h2>
            <Link href="/admin/requests" className="small">View all →</Link>
          </div>
          {queue.length === 0 ? (
            <p className="muted small" style={{ margin: 0 }}>
              Nothing to match right now. 🎉
            </p>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Seeker</th>
                    <th>Package</th>
                    <th>Preferred times</th>
                    <th aria-hidden />
                  </tr>
                </thead>
                <tbody>
                  {queue.map((r) => (
                    <tr key={r.id}>
                      <td>{r.seeker.name}</td>
                      <td>
                        <div>{r.skillName}</div>
                        <div className="muted small">{r.commitmentMonths}-month plan</div>
                      </td>
                      <td className="muted small">
                        {r.times.length
                          ? `${r.times.length} slot${r.times.length === 1 ? "" : "s"} · first ${whenLabel(r.times[0].datetime)}`
                          : "-"}
                      </td>
                      <td>
                        <Link href={`/admin/requests/${r.id}`} className="btn btn--primary btn--small">
                          Match
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Quick links */}
        <div className="widgetGrid">
          <Link href="/admin/users" className="card" style={{ textDecoration: "none", color: "inherit" }}>
            <h2 style={{ fontSize: "1.05rem" }}>Users &amp; approvals →</h2>
            <p className="muted small" style={{ margin: "0.3rem 0 0" }}>
              {stats.pendingProviders} provider{stats.pendingProviders === 1 ? "" : "s"} awaiting approval.
            </p>
          </Link>
          <Link href="/admin/invoices" className="card" style={{ textDecoration: "none", color: "inherit" }}>
            <h2 style={{ fontSize: "1.05rem" }}>Invoices →</h2>
            <p className="muted small" style={{ margin: "0.3rem 0 0" }}>
              {stats.pendingInvoices} unpaid invoice{stats.pendingInvoices === 1 ? "" : "s"}.
            </p>
          </Link>
        </div>
      </div>
    </DashboardShell>
  );
}
