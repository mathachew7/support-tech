import { auth } from "@/lib/auth/auth";
import DashboardHeader from "@/app/_components/DashboardHeader";
import { getSeekerProfile } from "@/lib/services/seekers";
import SeekerProfileForm from "./profile-form";

export default async function SeekerDashboard() {
  const session = await auth();
  const profile = await getSeekerProfile(session!.user!.id!);

  return (
    <main className="page">
      <DashboardHeader name={session!.user!.name!} role="seeker" />

      <div className="stack" style={{ gap: "1.25rem" }}>
        <div className="stack" style={{ gap: "0.35rem" }}>
          <h1>Welcome, {profile?.name}</h1>
          <p className="muted small">
            Requesting sessions arrives in the next phase. For now, set up your
            profile so we can match you well.
          </p>
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
    </main>
  );
}
