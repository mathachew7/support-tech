import Link from "next/link";
import { auth } from "@/lib/auth/auth";
import DashboardShell from "@/app/_components/DashboardShell";
import { StatCard } from "@/app/_components/dashboard/StatCard";
import { StatusBadge } from "@/app/_components/dashboard/StatusBadge";
import { RequestsTable } from "@/app/_components/dashboard/RequestsTable";
import { RequestButton } from "@/app/_components/dashboard/RequestButton";
import { getSeekerProfile } from "@/lib/services/seekers";
import { getSeekerRequests } from "@/lib/services/requests";
import { listSeekerInvoices } from "@/lib/services/invoices";
import { ACTIVE_REQUEST_STATUSES } from "@/lib/services/requests-core";

const DAY = 86_400_000;
function dateLabel(d: Date) {
  return d.toLocaleDateString(undefined, { dateStyle: "medium" });
}

export default async function SeekerOverview() {
  const session = await auth();
  const seekerId = session!.user!.id!;
  const [profile, requests, invoices] = await Promise.all([
    getSeekerProfile(seekerId),
    getSeekerRequests(seekerId),
    listSeekerInvoices(seekerId),
  ]);

  // Server component renders per request; reading the clock here is intentional.
  // eslint-disable-next-line react-hooks/purity
  const now = Date.now();

  const awaiting = requests.filter((r) => r.status === "requested").length;
  const matched = requests.filter((r) => r.status === "matched").length;
  const closed = requests.filter((r) => r.status === "closed" || r.status === "cancelled").length;
  const activeCount = requests.filter((r) =>
    (ACTIVE_REQUEST_STATUSES as readonly string[]).includes(r.status),
  ).length;

  const latest = requests[0];
  const recent = requests.slice(0, 5);

  // Commitment progress for the latest request's plan window.
  let commitment: { label: string; sub: string; pct: number } | null = null;
  if (latest) {
    const start = latest.startDate.getTime();
    const end = latest.endDate.getTime();
    if (now < start) {
      commitment = {
        label: `Starts ${dateLabel(latest.startDate)}`,
        sub: `in ${Math.ceil((start - now) / DAY)} days`,
        pct: 0,
      };
    } else if (now >= end) {
      commitment = { label: "Plan complete", sub: "", pct: 100 };
    } else {
      const pct = Math.round(((now - start) / (end - start)) * 100);
      const monthIdx = Math.min(
        latest.commitmentMonths,
        Math.floor(((now - start) / (end - start)) * latest.commitmentMonths) + 1,
      );
      commitment = {
        label: `Month ${monthIdx} of ${latest.commitmentMonths}`,
        sub: `${Math.ceil((end - now) / DAY)} days left`,
        pct,
      };
    }
  }

  // Payments
  const pendingInvoices = invoices.filter((i) => i.status === "pending");
  const nextDue = pendingInvoices
    .map((i) => i.dueDate)
    .filter((x): x is Date => !!x)
    .sort((a, b) => a.getTime() - b.getTime())[0];

  // Profile completeness
  const checks: { label: string; done: boolean }[] = [
    { label: "a photo", done: !!profile?.avatarUrl },
    { label: "your headline", done: !!profile?.headline },
    { label: "your role & company", done: !!(profile?.position && profile?.company) },
    { label: "an about", done: !!profile?.bio },
    { label: "your location", done: !!profile?.location },
    { label: "a link (LinkedIn/GitHub)", done: !!(profile?.linkedin || profile?.github || profile?.website) },
    { label: "your skills", done: (profile?.skills?.length ?? 0) > 0 },
    { label: "your billing address", done: !!profile?.street },
  ];
  const filled = checks.filter((c) => c.done).length;
  const completeness = Math.round((filled / checks.length) * 100);
  const missing = checks.filter((c) => !c.done).map((c) => c.label);

  // Top skills requested
  const skillCounts = new Map<string, number>();
  for (const r of requests) {
    for (const s of r.skillName.split(",").map((x) => x.trim()).filter(Boolean)) {
      skillCounts.set(s, (skillCounts.get(s) ?? 0) + 1);
    }
  }
  const topSkills = [...skillCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6);

  return (
    <DashboardShell
      user={{ name: session!.user!.name!, email: session!.user!.email, role: "seeker" }}
      title="Overview"
    >
      <div className="stack" style={{ gap: "1.5rem" }}>
        {/* Header */}
        <div className="pageHead">
          <div className="stack" style={{ gap: "0.35rem" }}>
            <h1>Welcome back, {profile?.name?.split(" ")[0] ?? "there"} 👋</h1>
            <p className="muted small">
              Here&apos;s what&apos;s happening with your mentorship.
            </p>
          </div>
          <RequestButton activeCount={activeCount} />
        </div>

        {/* Stats */}
        <div className="statGrid">
          <StatCard value={requests.length} label="Total requests" />
          <StatCard value={awaiting} label="Awaiting a match" tone="amber" />
          <StatCard value={matched} label="Matched" tone="teal" />
          <StatCard value={closed} label="Closed" />
        </div>

        {/* Latest request + commitment progress */}
        {latest ? (
          <div className="card spotlight">
            <div className="row between" style={{ alignItems: "flex-start" }}>
              <div className="stack" style={{ gap: "0.5rem" }}>
                <span className="spotlight__eyebrow">Your latest request</span>
                <h2 style={{ fontSize: "1.35rem" }}>{latest.skillName}</h2>
                <p className="muted small" style={{ margin: 0 }}>
                  {latest.commitmentMonths}-month commitment · {latest.timezone.replace(/_/g, " ")}
                </p>
              </div>
              <StatusBadge status={latest.status} />
            </div>
            {commitment && (
              <div style={{ marginTop: "1rem" }}>
                <div className="row between small">
                  <span style={{ fontWeight: 700 }}>{commitment.label}</span>
                  <span className="muted">{commitment.sub}</span>
                </div>
                <div className="progressTrack">
                  <div className="progressFill" style={{ width: `${commitment.pct}%` }} />
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="card">
            <div className="stack" style={{ gap: "0.6rem", alignItems: "flex-start" }}>
              <h2 style={{ fontSize: "1.2rem" }}>No requests yet</h2>
              <p className="muted small" style={{ margin: 0 }}>
                Tell us what you&apos;re stuck on and we&apos;ll match you with a mentor.
              </p>
              <Link href="/seekers/dashboard/request" className="btn btn--primary">
                Make your first request
              </Link>
            </div>
          </div>
        )}

        {/* Payments + profile widgets */}
        <div className="widgetGrid">
          <div className="card stack" style={{ gap: "0.6rem" }}>
            <div className="row between">
              <h2 style={{ fontSize: "1.05rem" }}>Payments</h2>
              <Link href="/seekers/dashboard/payments" className="small">View →</Link>
            </div>
            {pendingInvoices.length > 0 ? (
              <p className="muted small" style={{ margin: 0 }}>
                <strong style={{ color: "var(--foreground)" }}>
                  {pendingInvoices.length} invoice{pendingInvoices.length === 1 ? "" : "s"}
                </strong>{" "}
                awaiting payment{nextDue ? ` · next due ${dateLabel(nextDue)}` : ""}.
              </p>
            ) : (
              <p className="muted small" style={{ margin: 0 }}>You&apos;re all caught up. 🎉</p>
            )}
          </div>

          <div className="card stack" style={{ gap: "0.5rem" }}>
            <div className="row between">
              <h2 style={{ fontSize: "1.05rem" }}>Profile</h2>
              <Link href="/seekers/dashboard/account" className="small">Edit →</Link>
            </div>
            <div className="row between small">
              <span style={{ fontWeight: 700 }}>{completeness}% complete</span>
            </div>
            <div className="progressTrack">
              <div className="progressFill" style={{ width: `${completeness}%` }} />
            </div>
            {missing.length > 0 && (
              <p className="muted small" style={{ margin: "0.2rem 0 0" }}>
                Add {missing.slice(0, 2).join(" and ")} to stand out.
              </p>
            )}
          </div>
        </div>

        {/* Top skills requested */}
        {topSkills.length > 0 && (
          <div className="card stack" style={{ gap: "0.75rem" }}>
            <h2 style={{ fontSize: "1.05rem" }}>Top skills you&apos;ve requested</h2>
            <div className="chipList">
              {topSkills.map(([skill, count]) => (
                <span key={skill} className="chipCount">
                  {skill} <b>{count}</b>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Recent requests */}
        {requests.length > 0 && (
          <div className="card stack">
            <div className="row between">
              <h2>Recent requests</h2>
              {requests.length > recent.length && (
                <Link href="/seekers/dashboard/sessions" className="small">View all →</Link>
              )}
            </div>
            <RequestsTable rows={recent} />
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
