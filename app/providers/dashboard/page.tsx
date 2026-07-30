import Link from "next/link";
import { auth } from "@/lib/auth/auth";
import DashboardShell from "@/app/_components/DashboardShell";
import { StatCard } from "@/app/_components/dashboard/StatCard";
import { StatusBadge } from "@/app/_components/dashboard/StatusBadge";
import { whenLabel } from "@/app/_components/dashboard/format";
import { getProviderProfile, getProviderBookings } from "@/lib/services/providers";

function StatusBanner({ status }: { status: string }) {
  if (status === "approved") {
    return (
      <p className="notice notice--success">
        Your account is <strong>approved</strong> - you&apos;re bookable.
      </p>
    );
  }
  if (status === "suspended") {
    return (
      <p className="notice notice--error">
        Your account is suspended. Contact an admin to be reinstated.
      </p>
    );
  }
  return (
    <p className="notice notice--info">
      Your account is <strong>pending approval</strong>. An admin reviews your
      profile before you become bookable.
    </p>
  );
}

export default async function ProviderOverview() {
  const session = await auth();
  const providerId = session!.user!.id!;
  const [profile, bookings] = await Promise.all([
    getProviderProfile(providerId),
    getProviderBookings(providerId),
  ]);

  const enrolled = new Set(bookings.map((b) => b.seeker?.id).filter(Boolean)).size;
  const upcoming = bookings.filter((b) => b.status === "scheduled").length;
  const completed = bookings.filter((b) => b.status === "completed").length;
  const next = bookings.find((b) => b.status === "scheduled");

  // A small preview of the seekers this provider is working with.
  const byId = new Map<
    string,
    { id: string; name: string; plan: string | null; commitmentMonths: number | null; sessions: number }
  >();
  for (const b of bookings) {
    const id = b.seeker?.id;
    if (!id) continue;
    const c = byId.get(id) ?? {
      id,
      name: b.seeker!.name,
      plan: b.request?.skillName ?? null,
      commitmentMonths: b.request?.commitmentMonths ?? null,
      sessions: 0,
    };
    c.sessions += 1;
    byId.set(id, c);
  }
  const seekers = [...byId.values()].slice(0, 4);

  return (
    <DashboardShell
      user={{ name: session!.user!.name!, email: session!.user!.email, role: "provider" }}
      title="Overview"
    >
      <div className="stack" style={{ gap: "1.5rem" }}>
        <div className="stack" style={{ gap: "0.35rem" }}>
          <h1>Welcome, {profile?.name?.split(" ")[0] ?? "there"} 👋</h1>
          <p className="muted small">Here&apos;s how your mentoring is going.</p>
        </div>

        <StatusBanner status={profile?.status ?? "pending"} />

        {/* Stats */}
        <div className="statGrid">
          <StatCard value={enrolled} label="Enrolled seekers" />
          <StatCard value={upcoming} label="Upcoming sessions" tone="amber" />
          <StatCard value={completed} label="Completed sessions" tone="teal" />
          <StatCard value={bookings.length} label="Total sessions" />
        </div>

        {/* Next session */}
        {next ? (
          <div className="card spotlight">
            <div className="row between" style={{ alignItems: "flex-start" }}>
              <div className="stack" style={{ gap: "0.5rem" }}>
                <span className="spotlight__eyebrow">Your next session</span>
                <h2 style={{ fontSize: "1.35rem" }}>{next.seeker?.name ?? "Seeker"}</h2>
                <p className="muted small" style={{ margin: 0 }}>
                  {whenLabel(next.datetime)} · {next.durationMin} min
                  {next.request ? ` · ${next.request.commitmentMonths}-month plan` : ""}
                </p>
              </div>
              <StatusBadge status={next.status} />
            </div>
          </div>
        ) : (
          <div className="card">
            <p className="muted small" style={{ margin: 0 }}>
              No upcoming sessions yet. Once an admin matches you with a seeker,
              they&apos;ll appear here.
            </p>
          </div>
        )}

        {/* My seekers preview */}
        {seekers.length > 0 && (
          <div className="card stack">
            <div className="row between">
              <h2 style={{ fontSize: "1.05rem" }}>Your seekers</h2>
              <Link href="/providers/dashboard/seekers" className="small">View all →</Link>
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Seeker</th>
                    <th>Package</th>
                    <th>Sessions</th>
                  </tr>
                </thead>
                <tbody>
                  {seekers.map((s) => (
                    <tr
                      key={s.id}
                      className="clickable"
                      style={{ cursor: "pointer" }}
                    >
                      <td style={{ fontWeight: 600 }}>
                        <Link
                          href={`/providers/dashboard/seekers/${s.id}`}
                          style={{ color: "inherit", textDecoration: "none" }}
                        >
                          {s.name}
                        </Link>
                      </td>
                      <td>
                        {s.plan ? (
                          <>
                            <div>{s.plan}</div>
                            {s.commitmentMonths && (
                              <div className="muted small">{s.commitmentMonths}-month plan</div>
                            )}
                          </>
                        ) : (
                          <span className="muted">-</span>
                        )}
                      </td>
                      <td>{s.sessions}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
