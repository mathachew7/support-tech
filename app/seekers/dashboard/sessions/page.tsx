import Link from "next/link";
import { auth } from "@/lib/auth/auth";
import DashboardShell from "@/app/_components/DashboardShell";
import { RequestsTable } from "@/app/_components/dashboard/RequestsTable";
import { RequestButton } from "@/app/_components/dashboard/RequestButton";
import { getSeekerRequests } from "@/lib/services/requests";

export default async function SeekerSessionsPage({
  searchParams,
}: {
  searchParams: Promise<{ requested?: string }>;
}) {
  const [session, { requested }] = await Promise.all([auth(), searchParams]);
  const requests = await getSeekerRequests(session!.user!.id!);
  const active = requests.filter(
    (r) => r.status === "requested" || r.status === "matched",
  );
  const activeCount = active.length;

  return (
    <DashboardShell
      user={{ name: session!.user!.name!, email: session!.user!.email, role: "seeker" }}
      title="Sessions"
    >
      <div className="stack" style={{ gap: "1.25rem" }}>
        {requested === "1" && (
          <p className="notice notice--success">
            Request submitted. An admin will match you with a provider - you&apos;ll
            see the status update here.
          </p>
        )}

        <div className="pageHead">
          <p className="muted small" style={{ margin: 0 }}>
            Your open requests and matched sessions.
          </p>
          <RequestButton activeCount={activeCount} />
        </div>

        <div className="card stack">
          <RequestsTable
            rows={active}
            empty={
              <p className="muted small" style={{ margin: 0 }}>
                No active requests.{" "}
                <Link href="/seekers/dashboard/request">Make one →</Link>
              </p>
            }
          />
        </div>
      </div>
    </DashboardShell>
  );
}
