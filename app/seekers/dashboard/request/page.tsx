import Link from "next/link";
import { auth } from "@/lib/auth/auth";
import DashboardShell from "@/app/_components/DashboardShell";
import { getSkillCatalog } from "@/lib/services/providers";
import { countActiveRequests } from "@/lib/services/requests";
import {
  isAtRequestLimit,
  remainingRequestSlots,
  MAX_ACTIVE_REQUESTS,
} from "@/lib/services/requests-core";
import RequestForm from "./request-form";

export default async function RequestSessionPage() {
  const session = await auth();
  const seekerId = session!.user!.id!;
  const [skills, activeCount] = await Promise.all([
    getSkillCatalog(),
    countActiveRequests(seekerId),
  ]);
  const atLimit = isAtRequestLimit(activeCount);

  return (
    <DashboardShell
      user={{ name: session!.user!.name!, email: session!.user!.email, role: "seeker" }}
      title="Request a session"
    >
      {atLimit ? (
        <div className="card">
          <div className="stack" style={{ gap: "0.6rem", alignItems: "flex-start" }}>
            <h2 style={{ fontSize: "1.2rem" }}>You&apos;ve reached your request limit</h2>
            <p className="muted small" style={{ margin: 0 }}>
              You can have up to {MAX_ACTIVE_REQUESTS} active requests at a time.
              Once an admin completes or cancels one, you can request another.
            </p>
            <Link href="/seekers/dashboard/sessions" className="btn btn--primary">
              View my sessions
            </Link>
          </div>
        </div>
      ) : (
        <div className="stack" style={{ gap: "1.25rem" }}>
          <p className="muted small">
            Tell us the skill, when you&apos;re free, and how long you&apos;d like
            support. An admin will match you with a provider.{" "}
            <strong>
              {remainingRequestSlots(activeCount)} of {MAX_ACTIVE_REQUESTS} slots available.
            </strong>
          </p>
          <RequestForm skills={skills.map((s) => s.name)} />
        </div>
      )}
    </DashboardShell>
  );
}
