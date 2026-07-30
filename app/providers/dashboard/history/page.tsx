import { auth } from "@/lib/auth/auth";
import DashboardShell from "@/app/_components/DashboardShell";
import { ProviderSessionsTable } from "@/app/_components/dashboard/ProviderSessionsTable";
import { getProviderBookings } from "@/lib/services/providers";

const PAST = new Set(["completed", "no_show", "cancelled"]);

export default async function ProviderHistoryPage() {
  const session = await auth();
  const all = await getProviderBookings(session!.user!.id!);
  const past = all.filter((b) => PAST.has(b.status));

  return (
    <DashboardShell
      user={{ name: session!.user!.name!, email: session!.user!.email, role: "provider" }}
      title="History"
    >
      <div className="stack" style={{ gap: "1.25rem" }}>
        <p className="muted small" style={{ margin: 0 }}>
          Sessions that have completed, were cancelled, or marked no-show.
        </p>

        <div className="card stack">
          <ProviderSessionsTable
            rows={past}
            empty={
              <p className="muted small" style={{ margin: 0 }}>No past sessions yet.</p>
            }
          />
        </div>
      </div>
    </DashboardShell>
  );
}
