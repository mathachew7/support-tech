import { auth } from "@/lib/auth/auth";
import DashboardShell from "@/app/_components/DashboardShell";
import { getOpenRequests } from "@/lib/services/admin";
import { AdminRequestsTable } from "./RequestsTable";

export default async function AdminRequestsPage({
  searchParams,
}: {
  searchParams: Promise<{ assigned?: string }>;
}) {
  const [session, { assigned }] = await Promise.all([auth(), searchParams]);
  const requests = await getOpenRequests();

  const rows = requests.map((r) => ({
    id: r.id,
    seekerName: r.seeker.name,
    seekerEmail: r.seeker.email,
    skillName: r.skillName,
    commitmentMonths: r.commitmentMonths,
    timezone: r.timezone,
    requestedDate: r.createdAt.toLocaleDateString(undefined, { dateStyle: "medium" }),
  }));

  return (
    <DashboardShell
      user={{ name: session!.user!.name!, email: session!.user!.email, role: "admin" }}
      title="Requests"
    >
      <div className="stack" style={{ gap: "1.25rem" }}>
        {assigned === "1" && (
          <p className="notice notice--success">
            Provider assigned - the session is scheduled and now shows on both
            dashboards.
          </p>
        )}

        <p className="muted small" style={{ margin: 0 }}>
          Seeker requests awaiting a provider match.
        </p>

        <div className="card stack">
          <AdminRequestsTable rows={rows} />
        </div>
      </div>
    </DashboardShell>
  );
}
