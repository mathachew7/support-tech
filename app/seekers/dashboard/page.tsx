import Link from "next/link";
import { auth } from "@/lib/auth/auth";
import DashboardShell from "@/app/_components/DashboardShell";
import { getSeekerProfile } from "@/lib/services/seekers";
import { getSeekerBookings } from "@/lib/services/bookings";
import SeekerProfileForm from "./profile-form";

const STATUS_LABEL: Record<string, string> = {
  requested: "Awaiting match",
  scheduled: "Scheduled",
  completed: "Completed",
  no_show: "No-show",
  cancelled: "Cancelled",
};

export default async function SeekerDashboard() {
  const session = await auth();
  const seekerId = session!.user!.id!;
  const [profile, bookings] = await Promise.all([
    getSeekerProfile(seekerId),
    getSeekerBookings(seekerId),
  ]);

  return (
    <DashboardShell
      user={{
        name: session!.user!.name!,
        email: session!.user!.email,
        role: "seeker",
      }}
      title="Dashboard"
    >
      <div className="stack" style={{ gap: "1.25rem" }}>
        <div className="row between">
          <div className="stack" style={{ gap: "0.35rem" }}>
            <h1>Welcome, {profile?.name}</h1>
            <p className="muted small">
              Need help with a skill? Request a session and we&apos;ll match you
              with a provider.
            </p>
          </div>
          <Link href="/seekers/dashboard/request" className="btn btn--primary">
            Request a session
          </Link>
        </div>

        <div className="card stack">
          <h2>Your sessions</h2>
          {bookings.length === 0 ? (
            <p className="muted small">
              No sessions yet.{" "}
              <Link href="/seekers/dashboard/request">Request your first one →</Link>
            </p>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>When</th>
                    <th>Skill</th>
                    <th>Provider</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((b) => (
                    <tr key={b.id}>
                      <td>
                        {b.datetime.toLocaleString(undefined, {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </td>
                      <td>{b.skill.name}</td>
                      <td>{b.provider?.name ?? "-"}</td>
                      <td>{STATUS_LABEL[b.status] ?? b.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="card stack">
          <h2>Your profile</h2>
          <SeekerProfileForm
            headline={profile?.headline ?? ""}
            bio={profile?.bio ?? ""}
            location={profile?.location ?? ""}
          />
        </div>
      </div>
    </DashboardShell>
  );
}
