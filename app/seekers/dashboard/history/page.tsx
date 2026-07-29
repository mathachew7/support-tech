import { auth } from "@/lib/auth/auth";
import DashboardShell from "@/app/_components/DashboardShell";
import { RequestsTable } from "@/app/_components/dashboard/RequestsTable";
import { getSeekerRequests } from "@/lib/services/requests";

const PAST = new Set(["cancelled", "closed"]);

export default async function SeekerHistoryPage() {
  const session = await auth();
  const requests = await getSeekerRequests(session!.user!.id!);
  const past = requests.filter((r) => PAST.has(r.status));

  return (
    <DashboardShell
      user={{ name: session!.user!.name!, email: session!.user!.email, role: "seeker" }}
      title="History"
    >
      <div className="stack" style={{ gap: "1.25rem" }}>
        <p className="muted small" style={{ margin: 0 }}>
          Requests that were closed or cancelled.
        </p>

        <div className="card stack">
          <RequestsTable
            rows={past}
            empty={
              <p className="muted small" style={{ margin: 0 }}>
                No past requests yet.
              </p>
            }
          />
        </div>
      </div>
    </DashboardShell>
  );
}
