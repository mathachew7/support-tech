import { auth } from "@/lib/auth/auth";
import DashboardShell from "@/app/_components/DashboardShell";
import { getSkillCatalog, getProviderProfile } from "@/lib/services/providers";
import ProviderProfileForm from "./profile-form";

/** minutes-from-midnight -> "HH:MM" for the time inputs. */
function minToHHMM(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function StatusBanner({ status }: { status: string }) {
  if (status === "approved") {
    return (
      <p className="notice notice--success">
        Your account is <strong>approved</strong> - you are bookable.
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
      Your account is <strong>pending approval</strong>. An admin will review
      your profile before you become bookable - completing it helps.
    </p>
  );
}

export default async function ProviderDashboard() {
  const session = await auth();
  const [catalog, profile] = await Promise.all([
    getSkillCatalog(),
    getProviderProfile(session!.user!.id!),
  ]);

  const initialSkills = (profile?.providerSkills ?? []).map((ps) => ({
    skillId: ps.skillId,
    proficiency: ps.proficiency,
  }));
  const initialAvailability = (profile?.availability ?? []).map((a) => ({
    day: a.day,
    start: minToHHMM(a.startMin),
    end: minToHHMM(a.endMin),
  }));

  return (
    <DashboardShell
      user={{
        name: session!.user!.name!,
        email: session!.user!.email,
        role: "provider",
      }}
      title="Your provider profile"
    >
      <div className="stack" style={{ gap: "1.25rem" }}>
        <p className="muted small">
          List the skills you teach and when you are available.
        </p>

        <StatusBanner status={profile?.status ?? "pending"} />

        <div className="card">
          <ProviderProfileForm
            base={{
              headline: profile?.headline ?? "",
              bio: profile?.bio ?? "",
              location: profile?.location ?? "",
            }}
            catalog={catalog}
            initialSkills={initialSkills}
            initialAvailability={initialAvailability}
          />
        </div>
      </div>
    </DashboardShell>
  );
}
