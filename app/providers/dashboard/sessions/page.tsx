import { auth } from "@/lib/auth/auth";
import DashboardShell from "@/app/_components/DashboardShell";
import { ProviderSessionsTable } from "@/app/_components/dashboard/ProviderSessionsTable";
import { getProviderBookings } from "@/lib/services/providers";

export default async function ProviderSessionsPage() {
  const session = await auth();
  const all = await getProviderBookings(session!.user!.id!);
  const bookings = all.filter((b) => b.status === "scheduled");

  return (
    <DashboardShell
      user={{ name: session!.user!.name!, email: session!.user!.email, role: "provider" }}
      title="Sessions"
    >
      <div className="stack" style={{ gap: "1.25rem" }}>
        <p className="muted small" style={{ margin: 0 }}>
          Your upcoming, scheduled sessions. Click one for full details.
        </p>

        <div className="card stack">
          <ProviderSessionsTable
            rows={bookings}
            empty={
              <p className="muted small" style={{ margin: 0 }}>
                No sessions assigned yet. Once an admin matches you with a seeker,
                they&apos;ll appear here.
              </p>
            }
          />
        </div>
      </div>
    </DashboardShell>
  );
}
