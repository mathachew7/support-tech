import { auth } from "@/lib/auth/auth";
import DashboardShell from "@/app/_components/DashboardShell";
import { getSkillCatalog } from "@/lib/services/providers";
import RequestForm from "./request-form";

export default async function RequestSessionPage() {
  const session = await auth();
  const skills = await getSkillCatalog();

  return (
    <DashboardShell
      user={{
        name: session!.user!.name!,
        email: session!.user!.email,
        role: "seeker",
      }}
      title="Request a session"
    >
      <div className="stack" style={{ gap: "1.25rem" }}>
        <p className="muted small">
          Tell us the skill and when you&apos;re free. We&apos;ll suggest
          approved providers; an admin confirms the match.
        </p>

        <div className="card">
          <RequestForm
            skills={skills.map((s) => ({
              id: s.id,
              name: s.name,
              category: s.category,
            }))}
          />
        </div>
      </div>
    </DashboardShell>
  );
}
