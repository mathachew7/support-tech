import { auth } from "@/lib/auth/auth";
import DashboardShell from "@/app/_components/DashboardShell";
import { MySeekersTable, type SeekerRow } from "@/app/_components/dashboard/MySeekersTable";
import { getProviderBookings } from "@/lib/services/providers";

type Pkg = { skillName: string; commitmentMonths: number; startDate: Date; endDate: Date };

function currentMonth(pkg: Pkg, now: number): string {
  const start = pkg.startDate.getTime();
  const end = pkg.endDate.getTime();
  if (now < start) return `Not started · 0 of ${pkg.commitmentMonths}`;
  if (now >= end) return `Complete · ${pkg.commitmentMonths} of ${pkg.commitmentMonths}`;
  const idx = Math.min(
    pkg.commitmentMonths,
    Math.floor(((now - start) / (end - start)) * pkg.commitmentMonths) + 1,
  );
  return `Month ${idx} of ${pkg.commitmentMonths}`;
}

export default async function ProviderSeekersPage() {
  const session = await auth();
  const bookings = await getProviderBookings(session!.user!.id!);

  // Server component renders per request; reading the clock here is intentional.
  // eslint-disable-next-line react-hooks/purity
  const now = Date.now();

  const byId = new Map<string, SeekerRow & { pkg?: Pkg }>();
  for (const b of bookings) {
    const id = b.seeker?.id;
    if (!id) continue;
    const row = byId.get(id) ?? {
      seekerId: id,
      name: b.seeker!.name,
      plan: null,
      commitmentMonths: null,
      currentMonth: null,
      sessions: 0,
      status: b.status,
    };
    row.sessions += 1;
    row.status = b.status;
    if (!row.pkg && b.request) {
      row.pkg = b.request;
      row.plan = b.request.skillName;
      row.commitmentMonths = b.request.commitmentMonths;
      row.currentMonth = currentMonth(b.request, now);
    }
    byId.set(id, row);
  }
  const rows = [...byId.values()];

  return (
    <DashboardShell
      user={{ name: session!.user!.name!, email: session!.user!.email, role: "provider" }}
      title="My seekers"
    >
      <div className="stack" style={{ gap: "1.25rem" }}>
        <p className="muted small" style={{ margin: 0 }}>
          The seekers assigned to you. Open one for their contact details and package.
        </p>

        <div className="card stack">
          <MySeekersTable
            rows={rows}
            empty={
              <p className="muted small" style={{ margin: 0 }}>
                No seekers yet. Once an admin matches you with a seeker, they&apos;ll
                appear here.
              </p>
            }
          />
        </div>
      </div>
    </DashboardShell>
  );
}
