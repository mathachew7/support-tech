import { auth } from "@/lib/auth/auth";
import DashboardShell from "@/app/_components/DashboardShell";
import { getProviderProfile, getSkillCatalog } from "@/lib/services/providers";
import { ProviderSkillsForm } from "../account/ProviderSkillsForm";
import { ProviderAvailabilityForm } from "../account/ProviderAvailabilityForm";

function minToHHMM(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export default async function ProviderSettingsPage() {
  const session = await auth();
  const providerId = session!.user!.id!;
  const [profile, catalog] = await Promise.all([
    getProviderProfile(providerId),
    getSkillCatalog(),
  ]);

  const initialSkills = (profile?.providerSkills ?? []).map((ps) => ({
    skillId: ps.skillId,
    proficiency: ps.proficiency as string,
  }));
  const initialAvailability = (profile?.availability ?? []).map((a) => ({
    day: a.day as string,
    start: minToHHMM(a.startMin),
    end: minToHHMM(a.endMin),
  }));

  return (
    <DashboardShell
      user={{ name: session!.user!.name!, email: session!.user!.email, role: "provider" }}
      title="Settings"
    >
      <div className="stack" style={{ gap: "1.25rem" }}>
        {/* Skills */}
        <div className="card stack">
          <div className="stack" style={{ gap: "0.25rem" }}>
            <h2>Skills</h2>
            <p className="muted small" style={{ margin: 0 }}>
              The skills you teach and your proficiency in each.
            </p>
          </div>
          <ProviderSkillsForm
            catalog={catalog.map((s) => ({ id: s.id, name: s.name, category: s.category }))}
            initialSkills={initialSkills}
          />
        </div>

        {/* Availability */}
        <div className="card stack">
          <div className="stack" style={{ gap: "0.25rem" }}>
            <h2>Availability</h2>
            <p className="muted small" style={{ margin: 0 }}>
              When you&apos;re free for sessions each week.
            </p>
          </div>
          <ProviderAvailabilityForm initialAvailability={initialAvailability} />
        </div>
      </div>
    </DashboardShell>
  );
}
